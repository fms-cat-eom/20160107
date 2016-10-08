# Everyday One Motion - 20160107  

"Cube & Tetrahedron"  

![](20160107.gif)  

WebGL, GPGPU Particle, Noise Particle  

[Everyday One Motion](http://motions.work/motions/53)

WebGL    
パーティクル多め  
GPGPUパーティクルたのしい  

## Cube

Cubeが分裂したりするやつ  
位置やサイズの遷移には `現実 += ( 理想 - 現実 ) * k` を利用

## Tetrahedron

3D Simplex Noiseを用いてパーティクルの位置に応じて速度を制御  
まるで流体のような動きを比較的安い技術で実現できる  
今回はじめて使ってみてとても面白かったので、今後積極的に使ってみたいです。  

## Motion Blur, Depth of Field

最終出力の10倍のフレーム速度でレンダリングし、10フレームごとに平均を取ることによりモーションブラーを実現  
目標位置を変えずに、カメラ位置を周囲に少し動かした状態で、フレームを6枚レンダリングし、それらの平均を取ることにより被写界深度を実現  
これらの2つを同時に行うと、1フレームのために60回レンダリングをする必要があります…  
オフライン出力だからこそできる力技  
blurとDoFなしの場合は、この大きさの場合はMacBook Proでも60FPS出ます。GPGPUすごい
