// supabase/functions/stripe-checkout/index.ts
// Enhanced version of your existing checkout function

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'MapBreak Integration',
    version: '1.0.0',
  },
});

function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    // Validate Stripe secret key
    if (!stripeSecret) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return corsResponse({ error: 'Stripe configuration error' }, 500);
    }

    const { price_id, success_url, cancel_url, mode } = await req.json();

    console.log('Received checkout request:', { price_id, success_url, cancel_url, mode });

    const error = validateParameters(
      { price_id, success_url, cancel_url, mode },
      {
        cancel_url: 'string',
        price_id: 'string',
        success_url: 'string',
        mode: { values: ['payment', 'subscription'] },
      },
    );

    if (error) {
      console.error('Parameter validation failed:', error);
      return corsResponse({ error }, 400);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Missing authorization header' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      console.error('Authentication error:', getUserError);
      return corsResponse({ error: 'Authentication failed' }, 401);
    }

    try {
      // Verify the price exists before proceeding
      const price = await stripe.prices.retrieve(price_id);
      if (!price.active) {
        return corsResponse({ error: 'This price is no longer active' }, 400);
      }

      // Get or create customer
      const { data: customer, error: getCustomerError } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (getCustomerError) {
        console.error('Database error:', getCustomerError);
        return corsResponse({ error: 'Failed to fetch customer information' }, 500);
      }

      let customerId: string;

      if (!customer || !customer.customer_id) {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        });

        const { error: createCustomerError } = await supabase
          .from('stripe_customers')
          .insert({
            user_id: user.id,
            customer_id: newCustomer.id,
          });

        if (createCustomerError) {
          console.error('Failed to save customer:', createCustomerError);
          await stripe.customers.del(newCustomer.id);
          return corsResponse({ error: 'Failed to create customer record' }, 500);
        }

        customerId = newCustomer.id;
      } else {
        customerId = customer.customer_id;
      }

      // Enhanced: Handle subscription record with user mapping
      if (mode === 'subscription') {
        const { error: subscriptionError } = await supabase
          .from('stripe_subscriptions')
          .upsert({
            user_id: user.id,  // ✅ Link to user
            customer_id: customerId,
            stripe_price_id: price_id,  // ✅ Store price ID
            product_id: price.product as string,  // ✅ Store product ID
            subscription_status: 'incomplete',  // ✅ Use standard status
          }, {
            onConflict: 'customer_id',
          });

        if (subscriptionError) {
          console.error('Failed to update subscription record:', subscriptionError);
          return corsResponse({ error: 'Failed to update subscription record' }, 500);
        }
      }

      // Create Checkout Session with enhanced metadata
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        client_reference_id: user.id,  // ✅ Add user ID for webhook
        payment_method_types: ['card'],
        line_items: [
          {
            price: price_id,
            quantity: 1,
          },
        ],
        mode,
        success_url,
        cancel_url,
        allow_promotion_codes: true,
        metadata: {
          user_id: user.id,  // ✅ Add metadata for webhook
        },
        // Enhanced: Add subscription data for webhooks
        ...(mode === 'subscription' && {
          subscription_data: {
            metadata: {
              user_id: user.id,
            },
          },
        }),
      });

      console.log(`Created checkout session ${session.id} for customer ${customerId} (user: ${user.id})`);
      return corsResponse({ sessionId: session.id, url: session.url });
    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError);
      return corsResponse({ 
        error: stripeError.message || 'Failed to create checkout session',
        code: stripeError.code
      }, 500);
    }
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return corsResponse({ 
      error: 'An unexpected error occurred',
      code: error.code
    }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string | undefined {
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) {
        return `Missing required parameter ${parameter}`;
      }
      if (typeof value !== 'string') {
        return `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
      }
    } else {
      if (!expectation.values.includes(value)) {
        return `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }

  return undefined;
}

---

// supabase/functions/stripe-webhook/index.ts
// NEW: Webhook handler for your table structure

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  appInfo: {
    name: 'MapBreak Webhook',
    version: '1.0.0',
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Received Stripe webhook:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout completion:', session.id);
  
  const userId = session.client_reference_id || session.metadata?.user_id;
  
  if (!userId) {
    console.error('No user ID found in checkout session');
    return;
  }

  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await updateSubscriptionRecord(subscription, userId);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing subscription creation:', subscription.id);
  
  const userId = subscription.metadata?.user_id;
  if (userId) {
    await updateSubscriptionRecord(subscription, userId);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription update:', subscription.id);
  
  // Find user by subscription ID
  const { data: existingRecord } = await supabase
    .from('stripe_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (existingRecord) {
    await updateSubscriptionRecord(subscription, existingRecord.user_id);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deletion:', subscription.id);
  
  const { error } = await supabase
    .from('stripe_subscriptions')
    .update({
      subscription_status: 'canceled',
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error marking subscription as canceled:', error);
  } else {
    console.log('Successfully marked subscription as canceled:', subscription.id);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for subscription:', invoice.subscription);
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    
    // Find user by subscription ID and update status
    const { data: existingRecord } = await supabase
      .from('stripe_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (existingRecord) {
      await updateSubscriptionRecord(subscription, existingRecord.user_id);
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed for subscription:', invoice.subscription);
  
  if (invoice.subscription) {
    const { error } = await supabase
      .from('stripe_subscriptions')
      .update({
        subscription_status: 'past_due',
      })
      .eq('stripe_subscription_id', invoice.subscription as string);

    if (error) {
      console.error('Error updating subscription status for failed payment:', error);
    }
  }
}

async function updateSubscriptionRecord(subscription: Stripe.Subscription, userId: string) {
  console.log('Updating subscription record for user:', userId);
  
  const { error } = await supabase
    .from('stripe_subscriptions')
    .upsert({
      user_id: userId,
      customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0].price.id,
      product_id: subscription.items.data[0].price.product as string,
      subscription_status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    }, {
      onConflict: 'stripe_subscription_id',
    });

  if (error) {
    console.error('Error updating subscription record:', error);
  } else {
    console.log('Successfully updated subscription record for user:', userId);
  }
}