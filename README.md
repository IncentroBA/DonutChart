## DonutChart

Display a simple donut chart with smooth hover effect. The input data is based on listview-style input. The item type is configurable. 

The size of the donut chart is relative to it's parent container. Place the donut chart inside a layoutgrid, for example, to set it's width. Relative widths work better in combination with responsive screens.

## Features

Set listview context within the app and configure chart value (`Integer`) and value names (`string`).

Configure the colors that will be used for each item in the list. The widget uses an array of 6 default colors.

Both the chart legend and the donut chart segments can be hovered to see some additional information inside a tooltip.

Sorting options: The results can be sorted by name, value or even via custom attribute (`Integer`).

Display unit type (`String`).

Unit type position: `before` or `after` the value.

Display the totals (`Boolean`).

## Usage

1. Install NPM package dependencies by using: `npm install`. If you use NPM v7.x.x, which can be checked by executing
   `npm -v`, execute: `npm install --legacy-peer-deps`.
1. Run `npm start` to watch for code changes. On every change:
    - the widget will be bundled;
    - the bundle will be included in a `dist` folder in the root directory of the project;
    - the bundle will be included in the `deployment` and `widgets` folder of the Mendix test project.
