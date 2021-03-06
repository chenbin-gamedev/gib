ig.module('game.server.entities.explosion')
.requires('game.shared.entities.explosion')
.defines(function() {

    EntityExplosion.inject({

        totalAnimDuration: 0.25,
        animTimer: null,

        init: function(x, y, settings) {
            this.parent(x, y, settings);

            // Networked entities require names.
            this.name = 'explosion-' + this.id;

            this.animTimer = new ig.Timer(this.totalAnimDuration);

            // Kill players within blast radius
            var players = ig.game.getEntitiesByType(EntityPlayer);
            for(var i=0; i<players.length; i++) {
                var player = players[i];

                if(this.distanceTo(player) < this.radius) {

                    var message = this.attacker.name + ' hit ' + player.name + '.';
                    ig.game.log(message);
                    ig.io.emit('info', message);

                    // Award point to attacker if not a suicide
                    if(player !== this.attacker) {
                        ig.game.clients[this.attacker.name].kills++;
                    }

                    // If player is upgraded, send his upgrade flying
                    if(player.upgraded) {
                        var upgrade = ig.game.spawnEntity(EntityUpgrade, player.pos.x, player.pos.y);
                        upgrade.setVelocityByAngle(this.angleTo(player), 300);
                    }

                    // Kill player.
                    player.kill();

                    // Ensure player cannot spawn right away.
                    var victim_client = ig.game.clients[player.name];
                    victim_client.respawn_timer.reset();

                    // Leave a corpse.
                    ig.game.spawnEntity(EntityCorpse, player.pos.x, player.pos.y);
                }
            }
        },

        update: function() {
            this.parent();

            if(this.animTimer.delta() > 0) {
                this.kill();
            } else {
                var remaining = -this.animTimer.delta();
                this.animProgress = percentCompleted = (this.totalAnimDuration - remaining) / this.totalAnimDuration;
            }
        }
    });
});
