import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
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

      // Handle subscription record
      if (mode === 'subscription') {
        const { error: subscriptionError } = await supabase
          .from('stripe_subscriptions')
          .upsert({
            customer_id: customerId,
            status: 'not_started',
          }, {
            onConflict: 'customer_id',
          });

        if (subscriptionError) {
          console.error('Failed to update subscription record:', subscriptionError);
          return corsResponse({ error: 'Failed to update subscription record' }, 500);
        }
      }

      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
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
      });

      console.log(`Created checkout session ${session.id} for customer ${customerId}`);
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