// You can find your project ID in your Dialogflow agent settings
const projectId = 'mbr-the-bot-27d73'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'quickstart-session-id';
const query = 'hello';
const languageCode = 'en-US';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

// The text query request.
const request = {
  session: sessionPath,
  queryInput: {
    text: {
      text: query,
      languageCode: languageCode,
    },
  },
};

// Send request and log result
sessionClient
  .detectIntent(request)
  .then(responses => {
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
  })
  .catch(err => {
    console.error('ERROR:', err);
  });

// Instantiates clients
const contextsClient = new dialogflow.ContextsClient();
const intentsClient = new dialogflow.IntentsClient();

// The path to identify the agent that owns the created intent.
const agentPath = intentsClient.projectAgentPath(projectId);

// Setup intents for ordering a pizza.

// First of all, let's create an intent that triggers pizza order flow.

// Output contexts for ordering pizza. They are used for matching follow-up
// intents. For pizza ordering intents, a "pizza" output context is used for
// hinting the conversation is about pizza ordering, not beer or something
// else. For the first intent, it returns responses asking users to provide
// size information, with a "size" output context for matching the intent
// asking for the size of the pizza.

// Note that session ID is unknown here, using asterisk.
const pizzaOutputContexts = [
  {
    name: contextsClient.contextPath(
      projectId,
      '*' /* sessionId */,
      'pizza_order'
    ),
    lifespanCount: 5,
  },
];

// The result of the matched intent.
const pizzaResult = {
  action: 'pizza',
  parameters: [
    {
      displayName: 'size',
      value: '$size',
      entityTypeDisplayName: '@size',
      mandatory: true,
      prompts: [
        'What size pizza would you like to order?',
        'Would you like a large, medium, or small pizza?',
      ],
    },
    {
      displayName: 'topping',
      value: '$topping',
      entityTypeDisplayName: '@topping',
      mandatory: true,
      prompts: ['What toppings would you like?'],
      isList: true,
    },
    {
      displayName: 'address',
      value: '$address',
      // The API provides a built-in entity type @sys.address for addresses.
      entityTypeDisplayName: '@sys.location',
      mandatory: true,
      prompts: ['What is the delivery address?'],
    },
  ],
  messages: [
    {
      text: {
        text: [
          'No problem. Getting a $size pizza with $topping and delivering ' +
            'to $address.',
        ],
      },
    },
    {
      text: {
        text: [
          'Reply "check" to place your order. Reply "cancel" to cancel ' +
            'your order. You can change your delivery address as well.',
        ],
      },
    },
    {
      quickReplies: {
        title:
          'No problem. Getting a $size pizza with $topping and ' +
          'delivering to $address.',
        quickReplies: ['Place order', 'Cancel'],
      },
      platform: 'PLATFORM_FACEBOOK',
    },
  ],
  outputContexts: pizzaOutputContexts,
};

// The phrases for training the linguistic model.
const pizzaPhrases = [
  {type: 'TYPE_EXAMPLE', parts: [{text: 'Order pizza'}]},
  {type: 'TYPE_EXAMPLE', parts: [{text: 'Pizza'}]},
  {
    type: 'TYPE_EXAMPLE',
    parts: [
      {text: 'Get me a '},
      {text: 'large', entityType: '@size', alias: 'size'},
      {text: ' '},
      {text: 'mushrooms', entityType: '@topping', alias: 'topping'},
      {text: ' for '},
      {
        text: '1 1st st, New York, NY',
        entityType: '@sys.location',
        alias: 'address',
      },
    ],
  },
  {
    type: 'TYPE_EXAMPLE',
    parts: [
      {text: "I'd like to order a "},
      {text: 'large', entityType: '@size', alias: 'size'},
      {text: ' pizza with '},
      {text: 'mushrooms', entityType: '@topping', alias: 'topping'},
    ],
  },
  {
    type: 'TYPE_TEMPLATE',
    parts: [{text: "I'd like a @size:size pizza"}],
  },
];

// The intent to be created.
const pizzaIntent = {
  displayName: 'Pizza',
  events: ['order_pizza'],
  // Webhook is disabled because we are not ready to call the webhook yet.
  webhookState: 'WEBHOOK_STATE_DISABLED',
  trainingPhrases: pizzaPhrases,
  mlEnabled: true,
  priority: 500000,
  result: pizzaResult,
};

const pizzaRequest = {
  parent: agentPath,
  intent: pizzaIntent,
};

// Create the pizza intent
sessionClient
  .createIntent(pizzaRequest)
  .then(responses => {
    console.log('Created Pizza intent:');
    logIntent(responses[0]);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });

// Create an intent to change the delivery address. This intent sets input
// contexts to make sure it's triggered in the conversation with the pizza
// intent created above.

// The input contexts are the output contexts of the pizza intent.
const changeDeliveryAddressInputContexts = [
  contextsClient.contextPath(projectId, '*' /* sessionId */, 'pizza_order'),
];

// Renew the pizza_order intent. Without doing so the lifespan count of the
// pizza_order intent will decrease and eventually disappear if the user
// changes the delivery address a couple times.
const changeDeliveryAddressOutputContexts = [
  {
    name: contextsClient.contextPath(
      projectId,
      '*' /* sessionId */,
      'pizza_order'
    ),
    lifespanCount: 5,
  },
];

// This intent requires the $address parameter to be provided. The other
// parameters are collected from the pizza_order context.
const changeDeliveryAddressParameters = [
  {
    displayName: 'address',
    entityTypeDisplayName: '@sys.location',
    mandatory: true,
    prompts: ['What is new address?'],
  },
  {
    displayName: 'size',
    value: '#pizza_order.size',
    entityTypeDisplayName: '@size',
  },
  {
    displayName: 'topping',
    value: '#pizza_order.topping',
    entityTypeDisplayName: '@topping',
    isList: true,
  },
];

const changeDeliveryAddressResult = {
  action: 'change-delivery-address',
  parameters: changeDeliveryAddressParameters,
  messages: [
    {
      text: {
        text: ['OK, the delivery address is changed to $address'],
      },
    },
    {text: {text: ['You ordered a $size pizza with $topping.']}},
    {
      text: {
        text: [
          'Reply "check" to place your order. Reply "cancel" to cancel ' +
            'your order. You can change your delivery address as well.',
        ],
      },
    },
  ],
  outputContexts: changeDeliveryAddressOutputContexts,
};

// The triggering phrases. One is an annotated example, the other is a
// template.
const changeDeliveryAddressPhrases = [
  {
    type: 'TYPE_EXAMPLE',
    parts: [
      {text: 'Change address to '},
      {
        text: '1 1st st, new york, ny',
        entityType: '@sys.location',
        alias: 'address',
      },
    ],
  },
  {
    type: 'TYPE_EXAMPLE',
    parts: [
      {
        text: '1 1st st, new york, ny',
        entityType: '@sys.location',
        alias: 'address',
      },
    ],
  },
];

const changeDeliveryAddressIntent = {
  displayName: 'ChangeDeliveryAddress',
  webhookState: 'WEBHOOK_STATE_DISABLED',
  trainingPhrases: changeDeliveryAddressPhrases,
  inputContexts: changeDeliveryAddressInputContexts,
  mlEnabled: true,
  priority: 500000,
  result: changeDeliveryAddressResult,
};

const changeDeliveryAddressRequest = {
  parent: agentPath,
  intent: changeDeliveryAddressIntent,
};

// Create the size intent
intentsClient
  .createIntent(changeDeliveryAddressRequest)
  .then(responses => {
    console.log('Created ChangeDeliveryAddress intent: ');
    logIntent(responses[0]);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });

// Finally, create two intents, one to place the order, and the other one to
// cancel it.

const placeOrderInputContexts = [
  contextsClient.contextPath(projectId, '*' /* sessionId */, 'pizza_order'),
];

// Collect all parameters from the "pizza_output".
const placeOrderParameters = [
  {
    displayName: 'size',
    value: '#pizza_order.size',
    entityTypeDisplayName: '@size',
  },
  {
    displayName: 'topping',
    value: '#pizza_order.topping',
    entityTypeDisplayName: '@topping',
    isList: true,
  },
  {
    displayName: 'address',
    value: '#pizza_order.address',
    entityTypeDisplayName: '@sys.location',
  },
];

const placeOrderResult = {
  action: 'pizza_confirm',
  parameters: placeOrderParameters,
  messages: [
    {
      text: {
        text: [
          'Sure! Getting a $size pizza with $topping and shipping to $address.',
        ],
      },
    },
  ],
  // Conclude the conversation by setting no output contexts and setting
  // resetContexts to true. This clears all existing contexts.
  outputContexts: [],
  resetContexts: true,
};

const placeOrderPhrases = [
  {type: 'TYPE_EXAMPLE', parts: [{text: 'check'}]},
  {type: 'TYPE_EXAMPLE', parts: [{text: 'confirm'}]},
  {type: 'TYPE_EXAMPLE', parts: [{text: 'yes'}]},
  {type: 'TYPE_EXAMPLE', parts: [{text: 'place order'}]},
];

const placeOrderIntent = {
  displayName: 'PlaceOrder',
  webhookState: 'WEBHOOK_STATE_ENABLED',
  trainingPhrases: placeOrderPhrases,
  inputContexts: placeOrderInputContexts,
  mlEnabled: true,
  priority: 500000,
  result: placeOrderResult,
};

const placeOrderRequest = {
  parent: agentPath,
  intent: placeOrderIntent,
};

intentsClient
  .createIntent(placeOrderRequest)
  .then(responses => {
    console.log('Created PlaceOrder intent: ');
    logIntent(responses[0]);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });

const cancelOrderInputContexts = [
  contextsClient.contextPath(projectId, '*' /* sessionId */, 'pizza_order'),
];

const cancelOrderResult = {
  action: 'cancel-order',
  parameters: [],
  messages: [{text: {text: ['Your order is canceled.']}}],
  outputContexts: [],
  resetContexts: true,
};

const cancelOrderPhrases = [
  {type: 'TYPE_EXAMPLE', parts: [{text: 'cancel'}]},
  {type: 'TYPE_EXAMPLE', parts: [{text: 'no'}]},
  {type: 'TYPE_EXAMPLE', parts: [{text: 'cancel order'}]},
  {type: 'TYPE_EXAMPLE', parts: [{text: "I don't want it any more"}]},
];

const cancelOrderIntent = {
  displayName: 'CancelOrder',
  webhookState: 'WEBHOOK_STATE_DISABLED',
  trainingPhrases: cancelOrderPhrases,
  inputContexts: cancelOrderInputContexts,
  mlEnabled: true,
  priority: 500000,
  result: cancelOrderResult,
};

const cancelOrderRequest = {
  parent: agentPath,
  intent: cancelOrderIntent,
};

intentsClient
  .createIntent(cancelOrderRequest)
  .then(responses => {
    console.log('Created Cancel Order intent: ');
    logIntent(responses[0]);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });