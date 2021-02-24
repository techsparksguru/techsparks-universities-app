module.exports = ({ env }) => {
  let providerOptions = env('AWS_SES_KEY')&&env('AWS_SES_SECRET') ? {
    key: env('AWS_SES_KEY'),
    secret: env('AWS_SES_SECRET'),
    amazon: env('AWS_REGION')||'https://email.us-east-1.amazonaws.com',
  } : {
    amazon: env('AWS_REGION')||'https://email.us-east-1.amazonaws.com',
  }
  return({
    email: {
        provider: 'amazon-ses',
        providerOptions: providerOptions,
        settings: {
          defaultFrom: env('EMAIL_FROM')||'info@techsparks.guru',
          defaultReplyTo: env('EMAIL_FROM')||'info@techsparks.guru',
        },
      },
  })};
  