<script setup>
import { ref, reactive, computed } from 'vue'
import input from './input.txt'
import { NodeLabelDirection } from 'v-network-graph'

var items = input.split('\n').filter((x) => !!x)

var connections = {}
for (var i = 0; i < items.length; i++) {
  var [a, b] = items[i].split('-')
  if (connections[a]) {
    connections[a].add(b)
  } else {
    connections[a] = new Set([b])
  }
  if (connections[b]) {
    connections[b].add(a)
  } else {
    connections[b] = new Set([a])
  }
}
var allPaths1 = ref([])
var allPaths2 = ref([])
function getPaths(node, path = [], allPaths, tolerance = 0) {
  //try to visit connections
  if (visitNode(node, path, allPaths, tolerance)) {
    //if successful then call this for those connections
    if (
      node == node.toLowerCase() &&
      path.filter((x) => x == node).length > tolerance
    ) {
      //we had a revisit to a small cave
      tolerance--
    }
    connections[node].forEach((next) => {
      getPaths(next, path.slice(), allPaths, tolerance)
    })
  }
}
function visitNode(node, currentPath, allPaths, tolerance) {
  // if (tolerance > 0) {
  // console.log(currentPath.indexOf(node), node, currentPath, tolerance)
  // }
  if (
    node != node.toLowerCase() ||
    currentPath.indexOf(node) == -1 ||
    (node != 'start' && tolerance > 0)
  ) {
    currentPath.push(node)
    // console.log(currentPath, node)
    if (node == 'end') {
      // console.log(currentPath)
      allPaths.push(currentPath)
      return false
    }
    return currentPath
  } else {
    return false
  }
  // if end then add to allPaths
}
console.log(connections)

const nodes = computed(() => {
  let nodes = {}
  Object.keys(connections).forEach((node) => {
    let size = node.toUpperCase() == node ? 32 : 16
    nodes[node] = { name: node, size }
  })
  return nodes
})
const edges = computed(() => {
  let edges = {}
  Object.entries(connections).forEach((entry) => {
    const [key, value] = entry
    value.forEach((node) => {
      edges[`${key}-${node}`] = { source: key, target: node }
    })
  })
  return edges
})
const configs = {
  node: {
    selectable: true,
    normal: {
      color: '#6013ad',
      radius: (node) => node.size,
    },
    hover: {
      color: '#430d78',
    },
    label: {
      fontSize: 11,
      color: '#ffffff',
      direction: NodeLabelDirection.CENTER,
    },
  },
  edge: {
    normal: {
      width: 2,
      color: '#c893fc',
    },
    hover: {
      color: '#aa3df6',
    },
  },
}
var layouts = reactive({
  nodes: {
    start: { x: 300, y: -125 },
    NY: { x: 300, y: -25 },
    gx: { x: 385, y: 25 },
    pf: { x: 215, y: 25 },
    ag: { x: 215, y: 125 },
    FD: { x: 150, y: 125 },
    pk: { x: 385, y: 125 },
    iz: { x: 300, y: 225 },
    ZQ: { x: 385, y: 225 },
    dc: { x: 450, y: 225 },
    BN: { x: 215, y: 225 },
    end: { x: 300, y: 325 },
  },
})

getPaths('start', [], allPaths1.value)
getPaths('start', [], allPaths2.value, 1)
</script>
<template>
  <div>
    <h2>Day 12</h2>
    <h4>Puzzle 1</h4>
    {{ allPaths1.length }}
    <h4>Puzzle 2</h4>
    {{ allPaths2.length }}
    <v-network-graph
      :nodes="nodes"
      :edges="edges"
      :configs="configs"
      :layouts="layouts"
    />
  </div>
</template>
<style scoped></style>
