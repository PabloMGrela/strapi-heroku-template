// module.exports = {
//   resolver: {
//     Query: {
//       restaurants: {
//         description: 'Return a list of restaurants by chef',
//         resolverOf: 'application::restaurant.restaurant.find', // Will apply the same policy on the custom resolver as the controller's action `find` located in `Restaurant.js`.
//         resolver: (obj, options, context) => {
//           return [
//             {
//               name: 'My first blog restaurant',
//               description: 'Whatever you want...',
//             },
//           ];
//         },
//       },
//     },
//     Mutation: {
//       updateRestaurant: {
//         description: 'Update an existing restaurant',
//         resolverOf: 'application::restaurant.restaurant.update', // Will apply the same policy on the custom resolver than the controller's action `update` located in `Restaurant.js`.
//         resolver: async (obj, options, { context }) => {
//           const where = context.params;
//           const data = context.request.body;

//           return await strapi.api.restaurant.services.restaurant.addRestaurant(data, where);
//         },
//       },
//     },
//   },
// };