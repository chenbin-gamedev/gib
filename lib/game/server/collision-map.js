ig.module('game.server.collision-map')
.requires('impact.collision-map')
.defines(function(){ "use strict";

ig.CollisionMap.inject({

	// Returns position of first tile collided with.
	// Returns false if no collision.
	trace2: function( x, y, vx, vy, objectWidth, objectHeight ) {

		// Set up the trace-result
		var res = {
			pos: {x: x, y: y},
			hit: null,
		};


		// Break the trace down into smaller steps if necessary
		var steps = Math.ceil(Math.max(Math.abs(vx), Math.abs(vy)) / this.tilesize);
		if( steps > 1 ) {
			var sx = vx / steps;
			var sy = vy / steps;

			for( var i = 0; i < steps && (sx || sy); i++ ) {
				this._traceStep2( res, x, y, sx, sy, objectWidth, objectHeight, vx, vy, i );

				x = res.pos.x;
				y = res.pos.y;
				if( res.hit !== null ) { break; }
			}
		}

		// Just one step
		else {
			this._traceStep2( res, x, y, vx, vy, objectWidth, objectHeight, vx, vy, 0 );
		}

		return res;
	},


	_traceStep2: function( res, x, y, vx, vy, width, height, rvx, rvy, step ) {

		res.pos.x += vx;
		res.pos.y += vy;

		//ig.game.spawnEntity(EntityDot, res.pos.x, res.pos.y);

		var t = 0;

		// Horizontal collision (walls)
		if( vx ) {
			var pxOffsetX = (vx > 0 ? width : 0);
			var tileOffsetX = (vx < 0 ? this.tilesize : 0);

			var firstTileY = Math.max( Math.floor(y / this.tilesize), 0 );
			var lastTileY = Math.min( Math.ceil((y + height) / this.tilesize), this.height );
			var tileX = Math.floor( (res.pos.x + pxOffsetX) / this.tilesize );

			// We need to test the new tile position as well as the current one, as we
			// could still collide with the current tile if it's a line def.
			// We can skip this test if this is not the first step or the new tile position
			// is the same as the current one.
			var prevTileX = Math.floor( (x + pxOffsetX) / this.tilesize );
			if( step > 0 || tileX == prevTileX || prevTileX < 0 || prevTileX >= this.width ) {
				prevTileX = -1;
			}

			// Still inside this collision map?
			if(	tileX >= 0 && tileX < this.width ) {
				for( var tileY = firstTileY; tileY < lastTileY; tileY++ ) {

					t = this.data[tileY][tileX];
					if(
						t == 1 || t > this.lastSlope // fully solid tile?
					) {
						// full tile collision!
						if(res.hit === null) res.hit = { x: tileX, y: tileY };
						x = res.pos.x = tileX * this.tilesize - pxOffsetX + tileOffsetX;
						rvx = 0;
						break;
					}
				}
			}
		}

		// Vertical collision (floor, ceiling)
		if( vy ) {
			var pxOffsetY = (vy > 0 ? height : 0);
			var tileOffsetY = (vy < 0 ? this.tilesize : 0);

			var firstTileX = Math.max( Math.floor(res.pos.x / this.tilesize), 0 );
			var lastTileX = Math.min( Math.ceil((res.pos.x + width) / this.tilesize), this.width );
			var tileY = Math.floor( (res.pos.y + pxOffsetY) / this.tilesize );

			var prevTileY = Math.floor( (y + pxOffsetY) / this.tilesize );
			if( step > 0 || tileY == prevTileY || prevTileY < 0 || prevTileY >= this.height ) {
				prevTileY = -1;
			}

			// Still inside this collision map?
			if( tileY >= 0 && tileY < this.height ) {
				for( var tileX = firstTileX; tileX < lastTileX; tileX++ ) {

					t = this.data[tileY][tileX];
					if(
						t == 1 || t > this.lastSlope // fully solid tile?
					) {
						// full tile collision!
						if(res.hit === null) res.hit = { x: tileX, y: tileY };
						res.pos.y = tileY * this.tilesize - pxOffsetY + tileOffsetY;
						break;
					}
				}
			}
		}

		// res is changed in place, nothing to return
	}
});

});