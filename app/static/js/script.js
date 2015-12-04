var last_id = 0;
var Renderer = function(canvas, editNodeCallback, addEdgeCallback) {
    var canvas = canvas.get(0);
    var ctx = canvas.getContext("2d");
    var particleSystem;
    var w = 10;
    var current = null;
    var newEdgeEnd = null;

    var that = {
      init: function(system) {
        //
        // the particle system will call the init function once, right before the
        // first frame is to be drawn. it's a good place to set up the canvas and
        // to pass the canvas size to the particle system
        //
        // save a reference to the particle system for use in the .redraw() loop
        particleSystem = system;

        // inform the system of the screen dimensions so it can map coords for us.
        // if the canvas is ever resized, screenSize should be called again with
        // the new dimensions
        that.resize();
        particleSystem.screenSize(canvas.width, canvas.height);
        particleSystem.screenPadding(80); // leave an extra 80px of whitespace per side

        // set up some event handlers to allow for node-dragging
        that.initMouseHandling();
      },

      resize: function() {
          if (particleSystem !== undefined)
            particleSystem.screenSize(canvas.width, canvas.height);
      },

      redraw: function() {
        // 
        // redraw will be called repeatedly during the run whenever the node positions
        // change. the new positions for the nodes can be accessed by looking at the
        // .p attribute of a given node. however the p.x & p.y values are in the coordinates
        // of the particle system rather than the screen. you can either map them to
        // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
        // which allow you to step through the actual node objects but also pass an
        // x,y point in the screen's coordinate system
        // 
        ctx.fillStyle = "white";
        ctx.fillRect(0,0, canvas.width, canvas.height);

        particleSystem.eachEdge(function(edge, pt1, pt2) {
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords

          // draw a line from pt1 to pt2
          ctx.strokeStyle = "rgba(0,0,0, .333)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.stroke();
          ctx.fillStyle = "black";
          ctx.fillText(edge.data.name, (pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);
        });

        particleSystem.eachNode(function(node, pt) {
          // node: {mass:#, p:{x,y}, name:"", data:{}}
          // pt:   {x:#, y:#}  node position in screen coords

          // draw a rectangle centered at pt
          ctx.fillStyle = (node.data.alone) ? "orange" : "black";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, w/2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillText(node.name, pt.x + w, pt.y + w);
        });

        if (newEdgeEnd !== null) {
            ctx.strokeStyle = "rgba(80,0,0, .333)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            var point = particleSystem.toScreen(current.point);
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(newEdgeEnd.x, newEdgeEnd.y);
            ctx.stroke();
        }
      },

      dragNodesMode: true,

      initMouseHandling: function() {

        // set up a handler object that will initially listen for mousedowns then
        // for moves and mouseups while dragging
        var handler = {
          clicked: function(e) {
            var pos = $(canvas).offset();
            var _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
            current = particleSystem.nearest(_mouseP);
            if (current.distance > 2*w)
                return false;

            if (that.dragNodesMode)
                if (current && current.node !== null)
                    // while we're dragging, don't let physics move the node
                    current.node.fixed = true;
                else
                    ;
            else
                newEdgeEnd = _mouseP;

            $(canvas).bind('mousemove', handler.dragged);
            $(window).bind('mouseup', handler.dropped);

            return false;
          },
          dragged: function(e) {
            var pos = $(canvas).offset();
            var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
            
            if (that.dragNodesMode)
                if (current && current.node !== null)
                    current.node.p = particleSystem.fromScreen(s);
                else
                    ;
            else
                newEdgeEnd = s;
            that.redraw();
            return false;
          },

          dropped: function(e) {
            if (current === null || current.node === undefined) return;
            if (that.dragNodesMode) {
                if (current.node !== null) current.node.fixed = false;
                current.node.tempMass = 1000;
            }
            else if (newEdgeEnd !== null) {
                var end = particleSystem.nearest(newEdgeEnd);
                if (end.distance <= 2*w)
                    if (current.node != end.node)
                        addEdgeCallback(current.node, end.node);
                    else
                        editNodeCallback(current.node);
            }
            current = null;
            newEdgeEnd = null;
            $(canvas).unbind('mousemove', handler.dragged);
            $(window).unbind('mouseup', handler.dropped);
            that.redraw();
            return false;
          }
        }

        // start listening
        $(canvas).mousedown(handler.clicked);

      },

    };
    return that;
};


var canvas = $("#viewport");

var sys = arbor.ParticleSystem();
sys.parameters({gravity: true}); // use center-gravity to make the graph settle nicely (ymmv)
var nodeBeingEdited = null;

// $("#save-name").click(function() {
    // nodeBeingEdited.name = $("#edit-name").val();
//     nodeBeingEdited.data.someStuff = $("#edit-stuff").val();
//     nodeBeingEdited = null;
//     $("#edit-name").val('');
//     $("#edit-stuff").val('');
//     sys.renderer.redraw();
// });

sys.renderer = Renderer(canvas, function editNodeCallback(node) {
    nodeBeingEdited = node;
    addNode(node);
    // $("#edit-name").val(node.name);
    // $("#edit-stuff").val(node.data.someStuff);
}, function addEdgeCallback(n1, n2) {
    var name = prompt("Ответ для этого перехода:");
    console.log();
    sys.addEdge(n1, n2, {name: n1.data['qu-name'] + " ==> " + n2.data['qu-name'] + " : " + name});
}); // our newly created renderer will have its .init() method called shortly by sys...

$(window).resize(function(){
    // Magic!
    // We shrink the canvas so that it doesn't affect its container size
    // Then calculate its size and then restore canvas size back
    canvas
        .attr("width", 1)
        .attr("height", 1)
        .attr("width", canvas.parent().width())
        .attr("height", canvas.parent().height());
   sys.renderer.resize();
}).resize();

sys.addNode("+", {"qu-name": "+"});
sys.addNode("-", {"qu-name": "+"});

function addNode(node) {
    resetForm($('#add_question'));
    console.log(node);
    document.getElementById("edit-question").style.display = "block";
    if (node) {
        document.getElementById("qu-id").value = node.data['id'];
        for (var key in node.data) {
            if (node.data.hasOwnProperty(key)) {
                var field = document.getElementById(key);
                if (field) {
                    field.value = node.data[key];
                }
            }
        }
    } else {
        last_id++;
        document.getElementById("qu-id").value = last_id.toString();
    }
    

    // var name = prompt("New node name");
    // var someStuff = prompt("Some other property");
    // sys.addNode(name, { someStuff: someStuff});
}

function resetForm($form) {
    $form[0].reset();
}

$("#add_question").submit(function(e) {

    var val = $("input[type=submit][clicked=true]").val();
    console.log(val);
    
    var data = $("#add_question").serializeArray();
    console.log(data);
    var res = {};
    for (var key in data) {
        console.log(key);
        res[data[key]['name']] = data[key]['value'];
    }
    console.log(res);
    console.log(res['qu-name']);
    if (nodeBeingEdited) {
        nodeBeingEdited.data = res;
        nodeBeingEdited.name = res['qu-name'];
        sys.renderer.redraw();
        console.log(nodeBeingEdited);
    } else {
        sys.addNode(res['qu-name'], res);
    }
    resetForm($('#add_question'));
    document.getElementById("edit-question").style.display = "none";
    e.preventDefault();
});

// or, equivalently:
//
// sys.graft({
//   nodes:{
//     f:{alone:true, mass:.25}
//   }, 
//   edges:{
//     a:{ b:{},
//         c:{},
//         d:{},
//         e:{}
//     }
//   }
// })