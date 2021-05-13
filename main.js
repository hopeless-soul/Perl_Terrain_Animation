window.onload = function () {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  var cols = 15;
  var rows = 15;

  ctx.lineWidth = 1;
  // ctx.strokeStyle = '#FFF';
  ctx.translate(0.5, 0.5); //#> unable aliasing

  var deg = (45 * Math.PI) / 180;
  var rotZ = 0.05;
  var rotZc = 0;
  var scale = 35;
  var zmlt = 1;
  var speed = 1;


  var xOffset = (canvas.width/2) - ((cols * scale)/2); ///xOffset = xOffset /2;
  var yOffset = (canvas.height/2) - ((rows * scale)/2); //yOffset += 300;

  var points2d = [];
  var points3d_processed = [];
  var points3d_temp = [];
  var points3d = [];
  var speedC = 0;
  var speedStepsC = 1;

  class Vector {
    X; Y; Z;
    constructor(x, y=null, z=null) {
      if(x==undefined) {try { throw("Undefined 1st argument. Set to 0."); } catch (e) { x=0; console.log(e); } }
      this.X=x; this.Y=y; this.Z=z;
    }
    coordinates() { return [this.X, this.Y, this.Z] }
  }

  function generate() {

    //NOTE: Generate grid array structer wich contaoins Vectors
    for ( let row=0; row < rows; row++ ) {
      for ( let col=0; col < cols; col++ ) {
        x=col; y=row; z=noise.simplex2(x, y)*zmlt;

        if (points3d.length-1 < row) { points3d.push([]); }
        points3d[y].push( new Vector(x*scale, y*scale, z*scale) );
      }
    }
  }
  function draw() {

    let maxX=0, minX=0, maxY=0, minY=0;

    points2d[0].forEach((point)=>{
      if (point.X > maxX) { maxX = point.X; }
      if (point.X < minX) { minX = point.X; }
      if (point.Y > maxY) { maxY = point.Y; }
      if (point.Y < minY) { minY = point.Y; }
    });
    points2d[points2d.length-1].forEach((point)=>{
      if (point.X > maxX) { maxX = point.X; }
      if (point.X < minX) { minX = point.X; }
      if (point.Y > maxY) { maxY = point.Y; }
      if (point.Y < minY) { minY = point.Y; }
    });

    var grad = ctx.createLinearGradient(minX, minY, maxX, maxY);


    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.2, "rgba(255,255,255,1)");
    grad.addColorStop(0.8, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");

    ctx.strokeStyle = grad;


    ctx.beginPath();
    for ( let row=0; row < points2d.length; row++ ) {
      for ( let col=0; col < points2d[row].length; col++ ) {
        x=col; y=row; z=0;
        ctx.moveTo(points2d[row][col].X, points2d[row][col].Y);
        ctx.lineTo( col<points2d[row].length-1 ? points2d[row][col+1].X : points2d[row][col].X, col<points2d[row].length-1 ? points2d[row][col+1].Y : points2d[row][col].Y );
        ctx.lineTo( row<points2d.length-1 ? points2d[row+1][col].X : points2d[row][col].X, row<points2d.length-1 ? points2d[row+1][col].Y : points2d[row][col].Y );
        ctx.lineTo(points2d[row][col].X, points2d[row][col].Y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }
  function move() {


    ///Vars
    points2d = [];
    points3d_temp = [];
    points3d_processed = [];
    speedC += speed;

    points3d_processed = points3d.map(a => ([...a]));

    ///Move
    points3d_processed.forEach((row)=>{
      var work_row = [];
      row.forEach((col)=>{
        work_row.push(new Vector(col.X, col.Y - speedC, col.Z ));
      });
      points3d_temp.push(work_row);
    });

    // Check For space and Shift
    if (speedC > scale*speedStepsC) {
      speedStepsC++;
      let temp_row = [];
      points3d_processed[points3d_processed.length-1].forEach((col)=>{
        temp_row.push(new Vector(col.X, col.Y+scale, noise.simplex2(col.X, col.Y)*scale*zmlt ));
      });
      points3d.push(temp_row);
      points3d.shift();
    }

    points3d_processed = points3d_temp.map(a => ([...a]));
    points3d_temp = [];

    ///Rotate Z
    points3d_processed.forEach((row)=>{
      var work_row = [];
      let x = scale*(cols/2), y = scale*(rows/2);
      row.forEach((col)=>{
        work_row.push(new Vector(
          Math.floor(Math.cos((rotZc*Math.PI)/180)*col.X-Math.sin((rotZc*Math.PI)/180)*col.Y  -x*Math.cos((rotZc*Math.PI)/180)+y*Math.sin((rotZc*Math.PI)/180)+y ),
          Math.floor(Math.sin((rotZc*Math.PI)/180)*col.X+Math.cos((rotZc*Math.PI)/180)*col.Y  -x*Math.sin((rotZc*Math.PI)/180)-y*Math.cos((rotZc*Math.PI)/180)+x ),
          Math.floor(col.Z+0+0)
        ));
      });
      points3d_temp.push(work_row);
    });
    rotZc += rotZ;
    points3d_processed = points3d_temp.map(a => ([...a]));
    points3d_temp = [];

    ///Rotate X
    points3d_processed.forEach((row)=>{
      var work_row = [];
      row.forEach((col)=>{
        work_row.push(new Vector(
          Math.floor(col.X+0+0),
          Math.floor(0+Math.cos(deg)*col.Y-Math.sin(deg)*col.Z),
          Math.floor(0+Math.sin(deg)*col.Y+Math.cos(deg)*col.Z)
        ));
      });
      points3d_temp.push(work_row);
    });

    points3d_processed = points3d_temp.map(a => ([...a]));
    points3d_temp = [];





    ///Project
    points3d_processed.forEach((row)=>{
      row2d = [];
      row.forEach((col)=>{
        row2d.push(new Vector(
          ( 1*col.X + 0*col.Y + 0*col.Z ) + xOffset,
          ( 0*col.X + 0*col.Y + 1*col.Z ) + yOffset ));
      });
      points2d.push(row2d);
    });
}


  function clear() {
    ctx.clearRect(0, -1, canvas.width, canvas.height);
  }

  generate();
  window.setInterval(()=>{
    clear();
    move();
    draw();
  }, 1000/240);


};
