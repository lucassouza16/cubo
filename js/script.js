	Element.prototype.cr = function(tipo){
		var el = document.createElement(tipo);
		el.st({
			'transform-style' : 'preserve-3d',
			'position' : 'absolute'
		});
		this.appendChild(el);

		return el;
	};

	Element.prototype.st = function(st){
		for (var prop in st) {
			var val = st[prop];

			this.style[prop] = val;
		}

		return this;
	};

	Object.defineProperty(Element.prototype, 'rotate', {
		get : function(){
			var self = this;
			return {
				get : function(){
					var rep = self.style.transform.toString().replace(/^rotate\((.*)deg\)$/, '$1');
					return parseFloat(rep || 0);
				},

				set : function(val){
					var angl = self.rotate.get()+val;
					if(angl > 360) angl -= 360;
					if(angl < 0) angl += 360;
					self.style.transform = 'rotate('+angl+'deg)';
				}
			}
		}
	});

	function animar(func, funcFim, num, tmp){
		var cnt = 0;
		var incr = num/10;

		function anim(){
			func(cnt);
			cnt += incr;
			if(cnt <= num){
				setTimeout(anim, tmp/10);
			}else{
				funcFim();
			}
		}

		anim();
	}

	window.ev = Element.prototype.ev = function(disp, fc){
		var calls = disp.split(' ');

		for (var i = 0; i < calls.length; i++) {
			this.addEventListener(calls[i], fc);
		}
	};

	var rotSelo = 0;

	var movendo = false, rx = -45, ry = -45;
	var msgSucesso = document.body.cr('div');
	msgSucesso.classList.add('msg-cubo-resolvido');


	var centro = document.body.cr('div');
	centro.st({
		'border' : '1px solid black'
	});

	function atRotacaoCubo(){
		centro.st({
			'transform' : 'rotateY('+ry+'deg) rotateX('+rx+'deg)'
		});
	}

	atRotacaoCubo();

	var touchMove = null;

	window.ev('mousedown touchstart', function(e){

		if(e.target === document.body){
			if(e.changedTouches != undefined) touchMove = e.changedTouches[0];
			movendo = true;
		}
	});

	window.ev('mouseup touchend', function(){
		movendo = false;
	});

	window.ev('mousemove', function(e){
		if(movendo){
			e.preventDefault();
			rx -= e.movementY/5;
			ry += e.movementX/5;
			atRotacaoCubo();
		}
	});

	window.ev('touchmove', function(e){
		if(movendo){
			rx += (touchMove.clientY - e.changedTouches[0].clientY)/5;
			ry -= (touchMove.clientX - e.changedTouches[0].clientX)/5;
			touchMove = e.changedTouches[0];

			atRotacaoCubo();
		}
	});

	function Cubo(x, y, z){
		var self = this;

		Cubo.lista.push(self);

		self.centroGirar = centro.cr('div');
		self.centro = self.centroGirar.cr('div');

		self.x = x;
		self.y = y;
		self.z = z;

		self.lados = {
			esq : Cubo.face(self.centro).st({
				'transform' : 'translateX(-'+(Cubo.tamCubo/2)+'px) rotateY(-90deg)'
			}),

			dir : Cubo.face(self.centro).st({
				'transform' : 'translateX('+(Cubo.tamCubo/2)+'px) rotateY(90deg)'
			}),

			frente : Cubo.face(self.centro).st({
				'transform' : 'translateZ('+(Cubo.tamCubo/2)+'px) rotateY(0deg)'
			}),

			tras : Cubo.face(self.centro).st({
				'transform' : 'translateZ(-'+(Cubo.tamCubo/2)+'px) rotateY(180deg)'
			}),

			cima : Cubo.face(self.centro).st({
				'transform' : 'translateY(-'+(Cubo.tamCubo/2)+'px) rotateX(90deg)'
			}),

			baixo : Cubo.face(self.centro).st({
				'transform' : 'translateY('+(Cubo.tamCubo/2)+'px) rotateX(-90deg)'
			})
		};

		self.cores = {
			esq : self.lados.esq.cr('div').st({'width' : '100%', 'height' : '100%', 'border-radius' : '10%', 'backface-visibility' : 'hidden'}),
			dir : self.lados.dir.cr('div').st({'width' : '100%', 'height' : '100%', 'border-radius' : '10%', 'backface-visibility' : 'hidden'}),
			frente : self.lados.frente.cr('div').st({'width' : '100%', 'height' : '100%', 'border-radius' : '10%', 'backface-visibility' : 'hidden'}),
			tras : self.lados.tras.cr('div').st({'width' : '100%', 'height' : '100%', 'border-radius' : '10%', 'backface-visibility' : 'hidden'}),
			cima : self.lados.cima.cr('div').st({'width' : '100%', 'height' : '100%', 'border-radius' : '10%', 'backface-visibility' : 'hidden'}),
			baixo : self.lados.baixo.cr('div').st({'width' : '100%', 'height' : '100%', 'border-radius' : '10%', 'backface-visibility' : 'hidden'}),
			atualizar : function(){
				self.lados.frente.appendChild(self.cores.frente);
				self.lados.tras.appendChild(self.cores.tras);
				self.lados.esq.appendChild(self.cores.esq);
				self.lados.dir.appendChild(self.cores.dir);
				self.lados.cima.appendChild(self.cores.cima);
				self.lados.baixo.appendChild(self.cores.baixo);
			},
			trocar : function(ordem, sent, contS){
				if(sent){
					var ant = self.cores[ordem[0]];

					for (var i = 1; i < ordem.length; i++) {

						var at = self.cores[ordem[i]];
						self.cores[ordem[i]] = ant;
						ant = at;
					}

					self.cores[ordem[0]] = ant;
				}else{
					var ant = self.cores[ordem[ordem.length - 1]];

					for (var i = ordem.length - 2; i >= 0; i--) {
						var at = self.cores[ordem[i]];
						self.cores[ordem[i]] = ant;
						ant = at;
					}

					self.cores[ordem[ordem.length - 1]] = ant;

				}
				self.cores.atualizar();
			}
		};

		self.lados.esq.ev('mousedown touchstart', function(e){
			if(Cubo.arrastando == null){
				e.preventDefault();
				Cubo.arrastando = {
					'lado' : 'esq',
					'cubo' : self
				};
			}
		});

		self.lados.dir.ev('mousedown touchstart', function(e){
			if(Cubo.arrastando == null){
				e.preventDefault();
				Cubo.arrastando = {
					'lado' : 'dir',
					'cubo' : self
				};
			}
		});

		self.lados.cima.ev('mousedown touchstart', function(e){
			if(Cubo.arrastando == null){
				e.preventDefault();
				Cubo.arrastando = {
					'lado' : 'cima',
					'cubo' : self
				};
			}
		});

		self.lados.baixo.ev('mousedown touchstart', function(e){
			if(Cubo.arrastando == null){
				e.preventDefault();
				Cubo.arrastando = {
					'lado' : 'baixo',
					'cubo' : self
				};
			}
		});

		self.lados.frente.ev('mousedown touchstart', function(e){
			if(Cubo.arrastando == null){
				e.preventDefault();
				Cubo.arrastando = {
					'lado' : 'frente',
					'cubo' : self
				};
			}
		});

		self.lados.tras.ev('mousedown touchstart', function(e){
			if(Cubo.arrastando == null){
				e.preventDefault();
				Cubo.arrastando = {
					'lado' : 'tras',
					'cubo' : self
				};
			}
		});

		self.posicao = function(){
			self.centro.st({
				'transform' : 'translateX('+self.x+'px) translateY('+self.y+'px) translateZ('+self.z+'px)'
			});
		};

		self.posicao();
	}

	Cubo.face = function(ct){
		return ct.cr('div').st({
			'width' : Cubo.tamCubo+'px',
			'height' : Cubo.tamCubo+'px',
			'background' : Cubo.cores.fundo,
			'border' : (0.03*Cubo.tamCubo)+'px solid '+Cubo.cores.fundo,
			'box-sizing' : 'border-box',
			'left' : '-'+(Cubo.tamCubo/2)+'px',
			'top' : '-'+(Cubo.tamCubo/2)+'px',
			'backface-visibility' : 'hidden'
		});
	};

	Cubo.girar = {
		'z' : function(sent, valor, salva, fcDps){
			if(!Cubo.animando){
				Cubo.animando = true;
				if(salva) Cubo.movimentos.push({'eixo' : 'z', 'sent' : sent, 'valor' : valor});
				var cbs = Cubo.filtrar(function(cb){ if(cb.z == valor) return cb;});
				animar(function(n){
					for (var i = 0; i < cbs.length; i++) {
						var cb = cbs[i];
						cb.centroGirar.st({'transform' : 'rotateZ('+(sent ? n : -1*n)+'deg)'});
					}
				}, function(){
					for (var i = 0; i < cbs.length; i++) {
						var cb = cbs[i];
						cb.centroGirar.st({'transform' : ''});
						if(sent){
							var antX = cb.x;
							cb.x = -1*cb.y;
							cb.y = antX;
							cb.cores.cima.rotate.set(90);
							cb.cores.baixo.rotate.set(90);
							cb.cores.dir.rotate.set(90);
							cb.cores.esq.rotate.set(90);

							cb.cores.frente.rotate.set(90);
							cb.cores.tras.rotate.set(-90);
						}else{
							var antX = -1*cb.x;
							cb.x = cb.y;
							cb.y = antX;
							cb.cores.baixo.rotate.set(-90);
							cb.cores.cima.rotate.set(-90);
							cb.cores.esq.rotate.set(-90);
							cb.cores.dir.rotate.set(-90);

							cb.cores.frente.rotate.set(-90);
							cb.cores.tras.rotate.set(90);
						}
						cb.posicao();
						cb.cores.trocar(['cima', 'dir', 'baixo', 'esq'], sent, true);
					}

					Cubo.animando = false;
					if(fcDps != undefined && fcDps != null) fcDps();
				}, 90, Cubo.velocAnim);
			}


		},

		'y' : function(sent, valor, salva, fcDps){
			if(!Cubo.animando){
				Cubo.animando = true;
				if(salva) Cubo.movimentos.push({'eixo' : 'y', 'sent' : sent, 'valor' : valor});
				var cbs = Cubo.filtrar(function(cb){ if(cb.y == valor) return cb;});
				animar(function(n){
					for (var i = 0; i < cbs.length; i++) {
						var cb = cbs[i];
						cb.centroGirar.st({'transform' : 'rotateY('+(sent ? -1*n : n)+'deg)'});
					}
				}, function(){
					for (var i = 0; i < cbs.length; i++) {
						var cb = cbs[i];
						cb.centroGirar.st({'transform' : ''});

						if(sent){
							var antX = cb.x;
							cb.x = -1*cb.z;
							cb.z = antX;
							cb.cores.cima.rotate.set(90);
							cb.cores.baixo.rotate.set(-90);
						}else{
							var antX = -1*cb.x;
							cb.x = cb.z;
							cb.z = antX;
							cb.cores.cima.rotate.set(-90);
							cb.cores.baixo.rotate.set(90);
						}
						cb.posicao();
						cb.cores.trocar(['tras', 'dir', 'frente', 'esq'], sent, false);
					}
					Cubo.animando = false;
					if(fcDps != undefined && fcDps != null) fcDps();
				}, 90, Cubo.velocAnim);
			}
		},

		'x' : function(sent, valor, salva, fcDps){
			if(!Cubo.animando){
				Cubo.animando = true;
				if(salva) Cubo.movimentos.push({'eixo' : 'x', 'sent' : sent, 'valor' : valor});
				var cbs = Cubo.filtrar(function(cb){ if(cb.x == valor) return cb;});
				animar(function(n){
					for (var i = 0; i < cbs.length; i++) {
						var cb = cbs[i];
						cb.centroGirar.st({'transform' : 'rotateX('+(sent ? -1*n : n)+'deg)'});
					}
				}, function(){
					for (var i = 0; i < cbs.length; i++) {
						var cb = cbs[i];
						cb.centroGirar.st({'transform' : ''});
						if(sent){
							var antY = -1*cb.y;
							cb.y = cb.z;
							cb.z = antY;
							cb.cores.baixo.rotate.set(180);
							cb.cores.tras.rotate.set(-180);
							cb.cores.dir.rotate.set(-90);
							cb.cores.esq.rotate.set(90);
						}else{
							var antY = cb.y;
							cb.y = -1*cb.z;
							cb.z = antY;
							cb.cores.cima.rotate.set(-180);
							cb.cores.tras.rotate.set(180);
							cb.cores.dir.rotate.set(90);
							cb.cores.esq.rotate.set(-90);
						}
						cb.posicao();
						cb.cores.trocar(['frente', 'baixo', 'tras', 'cima'], sent, false);
					}
					Cubo.animando = false;
					if(fcDps != undefined && fcDps != null) fcDps();
				}, 90, Cubo.velocAnim);
			}
		}
	};

	Cubo.cores = {
		'frente' : '#03a9f4',
		'tras' : '#fb9d11',
		'esq' : '#11fb4e',
		'dir' : '#fb111c',
		'cima' : '#e0e2e4',
		'baixo' : '#f5e134',
		'fundo' : '#5a5a58'
	};

	Cubo.arrastando = null;
	Cubo.animando = false;
	Cubo.dimensao = 3;
	if(Cubo.dimensao%2 == 0) Cubo.dimensao++;
	Cubo.tamCubo = window.innerWidth > 500 ? 100 : 60;
	Cubo.velocAnim = 100;
	Cubo.dimCentro = (Cubo.dimensao-1)/2;


	Cubo.lista = [];
	Cubo.movimentos = [];

	Cubo.filtrar = function(fc){
		var ret = [];

		for (var i = 0; i < Cubo.lista.length; i++) {
			var cb = fc(Cubo.lista[i], i);

			if(cb != undefined) ret.push(cb);
		}

		return ret;
	};

	window.ev('mouseup touchend', function(){Cubo.arrastando = null;});

	window.ev('touchmove mousemove', function(e){
		if(Cubo.arrastando != null){
			var touch = e.changedTouches != undefined ? e.changedTouches[0] : e;
			var target = document.elementFromPoint(touch.clientX, touch.clientY);

			switch(Cubo.arrastando.lado){
				case 'dir':
				var cubo = Cubo.lista.find(c => c.lados.dir.contains(target) && c != Cubo.arrastando.cubo);

				if(cubo != undefined){

					if(cubo.z == Cubo.arrastando.cubo.z){
						Cubo.girar.z(cubo.y > Cubo.arrastando.cubo.y, cubo.z, true, verificarSucesso);
					}else{
						Cubo.girar.y(cubo.z > Cubo.arrastando.cubo.z, cubo.y, true, verificarSucesso);
					}

					Cubo.arrastando = null;
				}
				break;

				case 'esq':
				var cubo = Cubo.lista.find(c => c.lados.esq.contains(target) && c != Cubo.arrastando.cubo);

				if(cubo != undefined){
					if(cubo.z == Cubo.arrastando.cubo.z){
						Cubo.girar.z(!(cubo.y > Cubo.arrastando.cubo.y), cubo.z, true, verificarSucesso);
					}else{
						Cubo.girar.y(!(cubo.z > Cubo.arrastando.cubo.z), cubo.y, true, verificarSucesso);
					}

					Cubo.arrastando = null;
				}
				break;

				case 'cima':
				var cubo = Cubo.lista.find(c => c.lados.cima.contains(target) && c != Cubo.arrastando.cubo);

				if(cubo != undefined){
					if(cubo.x == Cubo.arrastando.cubo.x){
						Cubo.girar.x(cubo.z > Cubo.arrastando.cubo.z, cubo.x, true, verificarSucesso);
					}else{
						Cubo.girar.z(cubo.x > Cubo.arrastando.cubo.x, cubo.z, true, verificarSucesso);
					}

					Cubo.arrastando = null;
				}
				break;

				case 'baixo':
				var cubo = Cubo.lista.find(c => c.lados.baixo.contains(target) && c != Cubo.arrastando.cubo);

				if(cubo != undefined){
					if(cubo.x == Cubo.arrastando.cubo.x){
						Cubo.girar.x(!(cubo.z > Cubo.arrastando.cubo.z), cubo.x, true, verificarSucesso);
					}else{
						Cubo.girar.z(!(cubo.x > Cubo.arrastando.cubo.x), cubo.z, true, verificarSucesso);
					}

					Cubo.arrastando = null;
				}
				break;

				case 'frente':
				var cubo = Cubo.lista.find(c => c.lados.frente.contains(target) && c != Cubo.arrastando.cubo);

				if(cubo != undefined){
					if(cubo.x == Cubo.arrastando.cubo.x){
						Cubo.girar.x(cubo.y > Cubo.arrastando.cubo.y, cubo.x, true, verificarSucesso);
					}else{
						Cubo.girar.y(!(cubo.x > Cubo.arrastando.cubo.x), cubo.y, true, verificarSucesso);
					}

					Cubo.arrastando = null;
				}
				break;

				case 'tras':
				var cubo = Cubo.lista.find(c => c.lados.tras.contains(target) && c != Cubo.arrastando.cubo);

				if(cubo != undefined){
					if(cubo.x == Cubo.arrastando.cubo.x){
						Cubo.girar.x(!(cubo.y > Cubo.arrastando.cubo.y), cubo.x, true, verificarSucesso);
					}else{
						Cubo.girar.y(cubo.x > Cubo.arrastando.cubo.x, cubo.y, true, verificarSucesso);
					}

					Cubo.arrastando = null;
				}
				break;
			}
		}
	});

	for (var cx = 0; cx < Cubo.dimensao; cx++) {
		var xpos = cx-Cubo.dimCentro;
		var x = xpos*Cubo.tamCubo;
		for (var cy = 0; cy < Cubo.dimensao; cy++) {
			var ypos = cy-Cubo.dimCentro;
			var y = ypos*Cubo.tamCubo;
			for (var cz = 0; cz < Cubo.dimensao; cz++) {
				var zpos = cz-Cubo.dimCentro;
				var z = zpos*Cubo.tamCubo;

				if(xpos == -1*Cubo.dimCentro ||
					xpos == Cubo.dimCentro ||
					ypos == -1*Cubo.dimCentro ||
					ypos == Cubo.dimCentro ||
					zpos == -1*Cubo.dimCentro ||
					zpos == Cubo.dimCentro){
					var cb = new Cubo(x,y,z);

				if(xpos == -1*Cubo.dimCentro){
					cb.cores.esq.st({'background': Cubo.cores.esq});
				}else if(xpos == Cubo.dimCentro){
					cb.cores.dir.st({
						'background': Cubo.cores.dir,
						'overflow' : 'hidden'
					});

					var legenda = cb.cores.dir.cr('img').st({
						'width' : (Cubo.tamCubo*Cubo.dimensao)+'px',
						'height' : (Cubo.tamCubo*Cubo.dimensao)+'px',
						'left' : '-'+(Cubo.tamCubo*(Cubo.dimensao-1-cz))+'px',
						'top' : '-'+(Cubo.tamCubo*cy)+'px',
						'display' : 'flex',
						'backface-visibility' : 'hidden'
					});
          legenda.setAttribute('src', 'img/rubrica.png');
					legenda.ondragstart = (e) => e.preventDefault();
				}

				if(ypos == -1*Cubo.dimCentro){
					cb.cores.cima.st({'background': Cubo.cores.cima});
				}else if(ypos == Cubo.dimCentro){
					cb.cores.baixo.st({'background': Cubo.cores.baixo});
				}

				if(zpos == -1*Cubo.dimCentro){
					cb.cores.tras.st({'background': Cubo.cores.tras});
				}else if(zpos == Cubo.dimCentro){
					cb.cores.frente.st({
						'background': Cubo.cores.frente,
						'overflow' : 'hidden'
					});
					var selo = cb.cores.frente.cr('img');
					selo.ondragstart = (e) => e.preventDefault();
					selo.setAttribute('src', 'img/logo.png');
					selo.st({
						'width' : (Cubo.tamCubo*Cubo.dimensao)+'px',
						'height' : (Cubo.tamCubo*Cubo.dimensao)+'px',
						'left' : '-'+(Cubo.tamCubo*cx)+'px',
						'top' : '-'+(Cubo.tamCubo*cy)+'px',
						'backface-visibility' : 'hidden'
					});
				}

				cb.cores.atualizar();
			}
		}
	}
}

var btnResolve = document.body.cr('button');
btnResolve.textContent = 'Resolver';
btnResolve.classList.add('botao-resolver');

function verificarSucesso(){
	var cbsDir = Cubo.filtrar(function(cb){if(cb.x == (Cubo.dimCentro*Cubo.tamCubo)){return cb;}});
	var cbsEsq = Cubo.filtrar(function(cb){if(cb.x == -1*(Cubo.dimCentro*Cubo.tamCubo)){return cb;}});
	var cbsFrente = Cubo.filtrar(function(cb){if(cb.z == (Cubo.dimCentro*Cubo.tamCubo)){return cb;}});
	var cbsTras = Cubo.filtrar(function(cb){if(cb.z == -1*(Cubo.dimCentro*Cubo.tamCubo)){return cb;}});
	var cbsBaixo = Cubo.filtrar(function(cb){if(cb.y == (Cubo.dimCentro*Cubo.tamCubo)){return cb;}});
	var cbsCima = Cubo.filtrar(function(cb){if(cb.y == -1*(Cubo.dimCentro*Cubo.tamCubo)){return cb;}});

	function verificarLado(arr, atrb){
		var iguais = true;

		for (var i = 0; i < arr.length-1; i++) {
			if(arr[i].cores[atrb].style.background != arr[i+1].cores[atrb].style.background){
				iguais = false;
				break;
			}
		}

		return iguais;
	}

	if(verificarLado(cbsDir, 'dir') &&
		verificarLado(cbsEsq, 'esq') &&
		verificarLado(cbsCima, 'cima') &&
		verificarLado(cbsBaixo, 'baixo') &&
		verificarLado(cbsFrente, 'frente') &&
		verificarLado(cbsTras, 'tras')){
		Cubo.movimentos = [];
	msgSucesso.textContent = 'Parabéns, você conseguiu resolver o cubo';
}else{
	msgSucesso.textContent = '';
}
}

window.ev('click', function(){msgSucesso.textContent = '';});

btnResolve.ev('click', function(){
	if(!Cubo.animando && Cubo.movimentos.length != 0){

		function resolver(){
			var mov = Cubo.movimentos[Cubo.movimentos.length - 1];
			Cubo.movimentos.splice(Cubo.movimentos.length - 1, 1);
			switch(mov.eixo){
				case 'x':
				Cubo.girar.x(!mov.sent, mov.valor, false, Cubo.movimentos.length == 0 ? null : resolver);
				break;
				case 'y':
				Cubo.girar.y(!mov.sent, mov.valor, false, Cubo.movimentos.length == 0 ? null : resolver);
				break;
				case 'z':
				Cubo.girar.z(!mov.sent, mov.valor, false, Cubo.movimentos.length == 0 ? null : resolver);
				break;
			}

		}

		resolver();
	}
});
