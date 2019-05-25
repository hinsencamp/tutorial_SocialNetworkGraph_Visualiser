document.getElementById("graphdata").defaultValue = JSON.stringify({
  Fabian: {
    name: "Fabian",
    friends: {
      Rey: { name: "Rey" },
      Ellie: { name: "Ellie" },
      Cassi: { name: "Cassi" }
    }
  },
  Rey: { name: "Rey", friends: { Fabian: { name: "Fabian" } } },
  Ellie: {
    name: "Ellie",
    friends: { Fabian: { name: "Fabian" }, Cassi: { name: "Cassi" } }
  },
  Cassi: {
    name: "Cassi",
    friends: { Fabian: { name: "Fabian" }, Ellie: { name: "Ellie" } }
  }
});

function loadData() {
  let graph2 = document.getElementById("graphdata").value;
  d3.selectAll("svg > *").remove();

  renderGraph(transformData(graph2));
}

function transformData(graphString) {
  const graph = JSON.parse(graphString);
  return {
    nodes: [
      ...Object.values(graph).map(node => {
        return { ...node, friends: Object.keys(node.friends) };
      })
    ],
    links: Object.values(graph).reduce((acc, node) => {
      return [
        ...acc,
        ...[...Object.keys(node.friends)].map(id => {
          return {
            source: node.name,
            target: id
          };
        })
      ];
    }, [])
  };
}

function renderGraph(graph) {
  var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
  var container = svg.append("g");

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id(function(d) {
          return d.name;
        })
        .distance(60)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  var link = container
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line");

  var node = container
    .selectAll(".node")
    .data(graph.nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  node
    .append("circle")
    .attr("r", 10)
    .attr("fill", function(d) {
      return color(d.name);
    });

  node
    .append("text")
    .attr("dx", 12)
    .text(function(d) {
      return d.name;
    });

  simulation.nodes(graph.nodes).on("tick", ticked);

  simulation.force("link").links(graph.links);
  // https://bl.ocks.org/mapio/53fed7d84cd1812d6a6639ed7aa83868
  svg.call(
    d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", function() {
        container.attr("transform", d3.event.transform);
      })
  );

  function ticked() {
    link
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });

    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}
