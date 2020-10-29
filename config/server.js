module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'e1SIv1IxOLNexxRO7LmakGv6rsdMwPuikYJjefYPRaifXOQCUY1lbKv8YNbHQuOsoUCKc70OE4e3X4rHXALLGQ=='),
    },
  }
});
