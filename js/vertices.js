var cubeVertices = function() {
  'use strict';

  let b = [
    [-1,-1,1],[0,0,1],
    [1,-1,1],[0,0,1],
    [1,1,1],[0,0,1],
    [-1,-1,1],[0,0,1],
    [1,1,1],[0,0,1],
    [-1,1,1],[0,0,1]
  ];

  let bm = function( _xRot, _yRot ) {
    return b.reduce( function( _arr, _v, _i ) {
      let x = b[ _i ][ 0 ];
      let y = b[ _i ][ 1 ];
      let z = b[ _i ][ 2 ];

      let zTemp = Math.cos( _yRot ) * z - Math.sin( _yRot ) * x;
      x = Math.sin( _yRot ) * z + Math.cos( _yRot ) * x;
      z = zTemp;

      let yTemp = Math.cos( _xRot ) * y - Math.sin( _xRot ) * z;
      z = Math.sin( _xRot ) * y + Math.cos( _xRot ) * z;
      y = yTemp;

      return _arr.concat( [ x, y, z, 0 ] );
    }, [] );
  };

  let a = bm( 0.0, 0.0 );
  a = a.concat( bm( 0.0, Math.PI / 2.0 ) );
  a = a.concat( bm( 0.0, Math.PI ) );
  a = a.concat( bm( 0.0, Math.PI / 2.0 * 3.0 ) );
  a = a.concat( bm( Math.PI / 2.0, 0.0 ) );
  a = a.concat( bm( -Math.PI / 2.0, 0.0 ) );
  return a;
};

var tetraVertices = function() {
  'use strict';

  let n = 1.0 / Math.sqrt( 3.0 );
  let b = [
    [-1,-1,1],[n,-n,-n],
    [1,1,1],[n,-n,-n],
    [-1,1,-1],[n,-n,-n]
  ];

  let bm = function( _xRot, _yRot ) {
    return b.reduce( function( _arr, _v, _i ) {
      let x = b[ _i ][ 0 ];
      let y = b[ _i ][ 1 ];
      let z = b[ _i ][ 2 ];

      let zTemp = Math.cos( _yRot ) * z - Math.sin( _yRot ) * x;
      x = Math.sin( _yRot ) * z + Math.cos( _yRot ) * x;
      z = zTemp;

      let yTemp = Math.cos( _xRot ) * y - Math.sin( _xRot ) * z;
      z = Math.sin( _xRot ) * y + Math.cos( _xRot ) * z;
      y = yTemp;

      return _arr.concat( [ x, y, z, 0 ] );
    }, [] );
  };

  let a = bm( 0.0, 0.0 );
  a = a.concat( bm( 0.0, Math.PI ) );
  a = a.concat( bm( Math.PI, 0.0 ) );
  a = a.concat( bm( Math.PI, Math.PI ) );
  return a;
};
