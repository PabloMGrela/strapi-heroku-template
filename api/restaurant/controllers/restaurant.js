'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require('strapi-utils')
const geolib = require('geolib');

module.exports = {
	async findOne(ctx) {

		let userCoords
      	if (ctx.query["coords"]) {
      		let latitude = ctx.query["coords"].split(",", 2)[0]
      		let longitude = ctx.query["coords"].split(",", 2)[1]
      		userCoords = { latitude: latitude, longitude: longitude}
			ctx.query["coords"] = null
      		//return [userCoords]
      	}

      	let radioFilter
      	if (ctx.query["radio"]) {
			radioFilter = ctx.query["radio"]
			ctx.query["radio"] = null
      	}

    	const { id } = ctx.params;

    	if (id == "my") {

    		if (ctx.state.user) {
    			let entities = await strapi.services.restaurant.find({ owners: ctx.state.user.id });
				let restaurants = entities.map(entity => { return mapRestaurant(entity, ctx.state.user, userCoords, radioFilter) })
				return restaurants
    		} else {
    			return null
    		}

		} else if (id == "favorites") {

			if (ctx.state.user) {
				//const user = await strapi.query('user', 'users-permissions').findOne({ email: ctx.state.user.email });
				//let ids = user.favorites.map(favorite => { return favorite.id })
				//let entities = await strapi.services.restaurant.find({ id: ids });
				let entities = await strapi.services.restaurant.find({ users: ctx.state.user.id });
				let restaurants = entities.map(entity => { return mapRestaurant(entity, ctx.state.user, userCoords, radioFilter) })
				return restaurants
			} else {
				return null
			}

    	} else {

    		const entity = await strapi.services.restaurant.findOne({ id });
    		return mapRestaurant(entity, favorites, userCoords, radioFilter);
		}
  	},

	async find(ctx) {

		let userCoords
      	if (ctx.query["coords"]) {
      		let latitude = ctx.query["coords"].split(",", 2)[0]
      		let longitude = ctx.query["coords"].split(",", 2)[1]
      		userCoords = { latitude: latitude, longitude: longitude}
			ctx.query["coords"] = null
      		//return [userCoords]
      	}

		let radioFilter
      	if (ctx.query["radio"]) {
			radioFilter = ctx.query["radio"]
			ctx.query["radio"] = null
      	}

    	let entities
    	if (ctx.query._q) {
      		entities = await strapi.services.restaurant.search(ctx.query)
      	} else if (ctx.query["coords"]) {
      		let coords = ctx.query["coords"]
      		ctx.query["coords"] = null
      		entities = await strapi.services.restaurant.find(ctx.query)
    	} else {
      		entities = await strapi.services.restaurant.find(ctx.query)
    	}

    	return entities.map(entity => { return mapRestaurant(entity, ctx.state.user, userCoords, radioFilter) }).filter((i) => i)
  	}
}

function mapRestaurant(entity, user, userCoords, radioFilter) {
	
	if (entity == null) {
		return null
	}

	const restaurant = sanitizeEntity(entity, { model: strapi.models.restaurant })

	// Remove expired menus and menus with less than 7 days
	restaurant.menus = restaurant.menus.map(menu => {
  		var currentDate = new Date()
		currentDate.setDate(currentDate.getDate())
		currentDate.setHours(0, 0, 0, 0)

		let menuDate = new Date(menu.date+'T00:00:00.000')
		let days = Math.round((menuDate-currentDate)/(1000*60*60*24))
		if (days >= 0 && days < 7) {
			return menu
		}
	}).filter((i) => i)

	// Check if is favorite for logged user
	if (user && restaurant.users.findIndex(u => u.id === user.id) >= 0) {
		restaurant.is_favorite = true
	} else {
		restaurant.is_favorite = false
	}

	// Remove all users from entity
	if (restaurant.users) {
		delete restaurant.users
	}

	// Remove all owners from entity
	if (restaurant.owners) {
		delete restaurant.owners
	}

	// Calculate distance
	if (userCoords && restaurant.latitude && restaurant.longitude) {
		restaurant.distance = geolib.getDistance({ latitude: userCoords.latitude, longitude: userCoords.longitude }, { latitude: restaurant.latitude, longitude: restaurant.longitude })
	}

	// Filter by distance radio
	if (restaurant.distance && radioFilter && radioFilter <= restaurant.distance) {
		return null
	}

	return restaurant
}
