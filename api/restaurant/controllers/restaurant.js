'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require('strapi-utils')

module.exports = {
	async findOne(ctx) {
		let favorites //= getFavorites(ctx)
		if (ctx.state.user) {
			const provider = ctx.state.user.provider
			const query = { provider };
        	query.email = ctx.state.user.email.toLowerCase();
      		const user = await strapi.query('user', 'users-permissions').findOne(query);
			favorites = user.favorites
		} else {
			console.log("no user")
		}

    	const { id } = ctx.params;
    	const entity = await strapi.services.restaurant.findOne({ id });
		return mapRestaurant(entity, favorites);
  	},

	async find(ctx) {
		let favorites //= getFavorites(ctx)
		if (ctx.state.user) {
			const provider = ctx.state.user.provider
			const query = { provider };
        	query.email = ctx.state.user.email.toLowerCase();
      		const user = await strapi.query('user', 'users-permissions').findOne(query);
			favorites = user.favorites
		} else {
			console.log("no user")
		}

		const params = ctx.params
		//console.log("Params: " + params)
    	let entities
    	if (ctx.query._q) {
      		entities = await strapi.services.restaurant.search(ctx.query)
    	} else {
      		entities = await strapi.services.restaurant.find(ctx.query)
    	}

    	return entities.map(entity => { return mapRestaurant(entity, favorites) })
  	}
}

function mapRestaurant(entity, favorites) {
	
	if (entity == null) {
		return null
	}

	const restaurant = sanitizeEntity(entity, { model: strapi.models.restaurant })

	// Remove expired menus
	let newMenus = []
	for (let i = 0; i < restaurant.menus.length; i++) {
      	let menu = restaurant.menus[i]

      	var currentDate = new Date()
		currentDate.setDate(currentDate.getDate())
		currentDate.setHours(0,0,0,0)

		let menuDate = new Date(menu.date+'T00:00:00.000')
		let days = Math.round((menuDate-currentDate)/(1000*60*60*24))
		if (days >= 0) {
			newMenus.push(menu)
		}
	}
	restaurant.menus = newMenus
	restaurant.is_favorite = false

	if (favorites) {
		for (let i = 0; i < favorites.length; i++) {
			let favorite = favorites[i]
			if (restaurant.id == favorite.id) {
				restaurant.is_favorite = true
			}
		}
	}

	// Remove all users from entity
	if (restaurant.users) {
		delete restaurant.users
	}

	// Remove only X values from users
	/*
	if (restaurant.users) {
		for (let step = 0; step < 1; step++) {
			delete restaurant.users[step].email
  			delete restaurant.users[step].username
  			delete restaurant.users[step].provider
  			delete restaurant.users[step].confirmed
  			delete restaurant.users[step].blocked
  			delete restaurant.users[step].role
  			delete restaurant.users[step].created_at
  			delete restaurant.users[step].updated_at
		}
	}
	*/

	return restaurant
}
