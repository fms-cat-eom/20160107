( function() {

	'use strict';

	// ------

  let cubeCountSqrt = 64;
  let cubeCount = cubeCountSqrt * cubeCountSqrt;
	let tetraCountSqrt = 64;
	let tetraCount = tetraCountSqrt * tetraCountSqrt;
	let blurStep = 10;
	let dofStep = 6;
	let randomTextureWidth = 256;
	let randomTextureHeight = 256;

	// ------

  let canvas = document.getElementById( 'canvas' );
	let gl = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );
	let glCat = new GLCat( gl );

	// ------

	let vbo = {};
	let framebuffer = {};
	let texture = {};
	let shader = {};
  let program = {};

	// ------

	let frame = 0;

  // ------

	var prepare = function() {

	  vbo.quad = glCat.createVertexbuffer( [ -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0 ] );
		vbo.cube = glCat.createVertexbuffer( ( function() {
			let a = [];
			for ( let iy = 0; iy < cubeCountSqrt; iy ++ ) {
				for ( let ix = 0; ix < cubeCountSqrt; ix ++ ) {
					for ( let iz = 0; iz < 36; iz ++ ) {
						a.push( ix );
						a.push( iy );
						a.push( iz );
					}
				}
			}
			return a;
		} )() );
		vbo.tetra = glCat.createVertexbuffer( ( function() {
			let a = [];
			for ( let iy = 0; iy < tetraCountSqrt; iy ++ ) {
				for ( let ix = 0; ix < tetraCountSqrt; ix ++ ) {
					for ( let iz = 0; iz < 12; iz ++ ) {
						a.push( ix );
						a.push( iy );
						a.push( iz );
					}
				}
			}
			return a;
		} )() );

	  // ------

	  framebuffer.cubeGpgpu = glCat.createFloatFramebuffer( cubeCountSqrt * 2, cubeCountSqrt );
	  framebuffer.cubeGpgpuReturn = glCat.createFloatFramebuffer( cubeCountSqrt * 2, cubeCountSqrt );
	  framebuffer.tetraGpgpu = glCat.createFloatFramebuffer( tetraCountSqrt * 4, tetraCountSqrt );
	  framebuffer.tetraGpgpuReturn = glCat.createFloatFramebuffer( tetraCountSqrt * 4, tetraCountSqrt );
		framebuffer.render = glCat.createFloatFramebuffer( canvas.width, canvas.height );
		framebuffer.post = glCat.createFloatFramebuffer( canvas.width, canvas.height );
		framebuffer.blur = glCat.createFloatFramebuffer( canvas.width, canvas.height );
	  framebuffer.blurReturn = glCat.createFloatFramebuffer( canvas.width, canvas.height );

	  // ------

	  texture.random = glCat.createTexture();
		glCat.setTextureFromFloatArray( texture.random, randomTextureWidth, randomTextureHeight, ( function() {
			let a = [];
			for ( let i = 0; i < randomTextureWidth * randomTextureHeight * 4; i ++ ) {
				a.push( Math.random() );
			}
			return a;
		} )() );
	  texture.cube = glCat.createTexture();
	  glCat.setTextureFromFloatArray( texture.cube, 2, 36, cubeVertices() );
		texture.tetra = glCat.createTexture();
		glCat.setTextureFromFloatArray( texture.tetra, 2, 12, tetraVertices() );

	};

  // ------

  let update = function() {

		for ( let iBlur = 0; iBlur < blurStep; iBlur ++ ) {
			let init = frame === 0.0;
	    let time = ( frame / 100.0 / blurStep ) % 1.0;

			{ // cube particle calculation
				glCat.useProgram( program.cubeGpgpu );
				gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer.cubeGpgpu );
				gl.viewport( 0, 0, cubeCountSqrt * 2, cubeCountSqrt );

				glCat.clear();
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

				glCat.attribute( 'position', vbo.quad, 3 );

				glCat.uniform1i( 'init', init );
				glCat.uniform1f( 'time', time );
				glCat.uniform1f( 'blurStep', blurStep );
				glCat.uniform1f( 'cubeCountSqrt', cubeCountSqrt );

				glCat.uniformTexture( 'randomTexture', texture.random, 0 );
				glCat.uniformTexture( 'particleTexture', framebuffer.cubeGpgpuReturn.texture, 1 );

				gl.drawArrays( gl.TRIANGLES, 0, vbo.quad.length / 3.0 );
			}

			{ // cube particle calculation return
				glCat.useProgram( program.return );
				gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer.cubeGpgpuReturn );
				gl.viewport( 0, 0, cubeCountSqrt * 2, cubeCountSqrt );

				glCat.clear();
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

				glCat.attribute( 'position', vbo.quad, 3 );

				glCat.uniform2fv( 'resolution', [ cubeCountSqrt * 2, cubeCountSqrt ] );

				glCat.uniformTexture( 'texture', framebuffer.cubeGpgpu.texture, 0 );

				gl.drawArrays( gl.TRIANGLES, 0, vbo.quad.length / 3.0 );
			}

			{ // tetra particle calculation
				glCat.useProgram( program.tetraGpgpu );
				gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer.tetraGpgpu );
				gl.viewport( 0, 0, tetraCountSqrt * 4, tetraCountSqrt );

				glCat.clear();
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

				glCat.attribute( 'position', vbo.quad, 3 );

				glCat.uniform1i( 'init', init );
				glCat.uniform1f( 'time', time );
				glCat.uniform2fv( 'randomReso', [ randomTextureWidth, randomTextureHeight ] );
				glCat.uniform1f( 'blurStep', blurStep );
				glCat.uniform1f( 'tetraCountSqrt', tetraCountSqrt );

				glCat.uniformTexture( 'randomTexture', texture.random, 0 );
				glCat.uniformTexture( 'particleTexture', framebuffer.tetraGpgpuReturn.texture, 1 );

				gl.drawArrays( gl.TRIANGLES, 0, vbo.quad.length / 3.0 );
			}

			{ // tetra particle calculation return
				glCat.useProgram( program.return );
				gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer.tetraGpgpuReturn );
				gl.viewport( 0, 0, tetraCountSqrt * 4, tetraCountSqrt );

				glCat.clear();
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

				glCat.attribute( 'position', vbo.quad, 3 );

				glCat.uniform2fv( 'resolution', [ tetraCountSqrt * 4, tetraCountSqrt ] );

				glCat.uniformTexture( 'texture', framebuffer.tetraGpgpu.texture, 0 );

				gl.drawArrays( gl.TRIANGLES, 0, vbo.quad.length / 3.0 );
			}

			for ( let iOffset = 0; iOffset < dofStep; iOffset ++ ) {
				let offsetX = Math.cos( iOffset / dofStep * 2.0 * Math.PI ) * 0.01;
				let offsetY = Math.sin( iOffset / dofStep * 2.0 * Math.PI ) * 0.01;

		    { // cube rendering
		      glCat.useProgram( program.cubeRender );
		      gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer.render );
		      gl.viewport( 0, 0, canvas.width, canvas.height );

		      glCat.clear( 1.0, 1.0, 1.0 );
		      gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

		      glCat.attribute( 'uv', vbo.cube, 3 );

		      glCat.uniform1f( 'time', time );
		      glCat.uniform1f( 'cubeCountSqrt', cubeCountSqrt );
		      glCat.uniform2fv( 'resolution', [ canvas.width, canvas.height ] );
					glCat.uniform3fv( 'offset', [ offsetX, offsetY, 0.0 ] );

		      glCat.uniformTexture( 'particleTexture', framebuffer.cubeGpgpu.texture, 0 );
		      glCat.uniformTexture( 'cubeTexture', texture.cube, 1 );

		      gl.drawArrays( gl.TRIANGLES, 0, vbo.cube.length / 3.0 );
		    }

		  	{ // tetra rendering
		      glCat.useProgram( program.tetraRender );
		      gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer.render );
		      gl.viewport( 0, 0, canvas.width, canvas.height );

		      gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

		      glCat.attribute( 'uv', vbo.tetra, 3 );

		      glCat.uniform1f( 'time', time );
		      glCat.uniform1f( 'tetraCountSqrt', tetraCountSqrt );
		      glCat.uniform2fv( 'resolution', [ canvas.width, canvas.height ] );
					glCat.uniform3fv( 'offset', [ offsetX, offsetY, 0.0 ] );

		      glCat.uniformTexture( 'particleTexture', framebuffer.tetraGpgpu.texture, 0 );
		      glCat.uniformTexture( 'tetraTexture', texture.tetra, 1 );

		      gl.drawArrays( gl.TRIANGLES, 0, vbo.tetra.length / 3.0 );
		    }

				{ // blur
		      glCat.useProgram( program.blur );
		      gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer.blur );
		      gl.viewport( 0, 0, canvas.width, canvas.height );

		    	glCat.clear();
		      gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

		      glCat.attribute( 'position', vbo.quad, 3 );

					glCat.uniform1i( 'init', iBlur === 0 && iOffset === 0 );
					glCat.uniform1f( 'add', 1.0 / blurStep / dofStep * 1.2 );
		      glCat.uniform2fv( 'resolution', [ canvas.width, canvas.height ] );

		      glCat.uniformTexture( 'postTexture', framebuffer.render.texture, 0 );
					glCat.uniformTexture( 'blurTexture', framebuffer.blurReturn.texture, 1 );

		      gl.drawArrays( gl.TRIANGLES, 0, vbo.quad.length / 3.0 );
		    }

				{ // blur return
		      glCat.useProgram( program.return );
					gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer.blurReturn );
		      gl.viewport( 0, 0, canvas.width, canvas.height );

		    	glCat.clear();
		      gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

		      glCat.attribute( 'position', vbo.quad, 3 );

		      glCat.uniform2fv( 'resolution', [ canvas.width, canvas.height ] );

					glCat.uniformTexture( 'texture', framebuffer.blur.texture, 1 );

		      gl.drawArrays( gl.TRIANGLES, 0, vbo.quad.length / 3.0 );
		    }
			}

			frame ++;
		}

		{ // draw
			glCat.useProgram( program.return );
			gl.bindFramebuffer( gl.FRAMEBUFFER, null );
			gl.viewport( 0, 0, canvas.width, canvas.height );

			glCat.clear();
			gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

			glCat.attribute( 'position', vbo.quad, 3 );

			glCat.uniform2fv( 'resolution', [ canvas.width, canvas.height ] );

			glCat.uniformTexture( 'texture', framebuffer.blur.texture, 1 );

			gl.drawArrays( gl.TRIANGLES, 0, vbo.quad.length / 3.0 );
		}

    if ( 200 * blurStep <= frame ) {
      // var url = canvas.toDataURL();
      // var a = document.createElement( 'a' );
      // a.download = ( '000' + frame ).slice( -4 ) + '.png';
      // a.href = url;
      // a.click();
    }

    requestAnimationFrame( update );

  };

  // ------

  let ready = false;

	document.getElementById( 'button' ).addEventListener( 'click', function() {
    if ( ready && frame === 0 ) {
			prepare();
      update();
    }
  } );

	document.getElementById( 'button2' ).addEventListener( 'click', function() {
    if ( ready && frame === 0 ) {
			blurStep = 1;
			dofStep = 1;
			prepare();
      update();
    }
  } );

  step( {

    0: function( _step ) {

			[
				'plane.vert',
				'return.frag',
				'cubegpgpu.frag',
				'cuberender.vert',
				'cuberender.frag',
				'tetragpgpu.frag',
				'tetrarender.vert',
				'tetrarender.frag',
				'blur.frag'
			].map( function( _name ) {
				requestText( './shader/' + _name, function( _text ) {
					shader[ _name ] = _text;
					_step();
				} );
			} );

		},

    9: function( _step ) {

      program.cubeGpgpu = glCat.createProgram( shader[ 'plane.vert' ], shader[ 'cubegpgpu.frag' ] );
			program.cubeRender = glCat.createProgram( shader[ 'cuberender.vert' ], shader[ 'cuberender.frag' ] );
			program.tetraGpgpu = glCat.createProgram( shader[ 'plane.vert' ], shader[ 'tetragpgpu.frag' ] );
			program.tetraRender = glCat.createProgram( shader[ 'tetrarender.vert' ], shader[ 'tetrarender.frag' ] );
      program.return = glCat.createProgram( shader[ 'plane.vert' ], shader[ 'return.frag' ] );
      program.blur = glCat.createProgram( shader[ 'plane.vert' ], shader[ 'blur.frag' ] );

      ready = true;

    }

  } );

} )();
