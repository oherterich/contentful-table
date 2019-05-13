import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TextInput,
} from '@contentful/forma-36-react-components';

import { init } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired,
  };

  detachExternalChangeHandler = null;

  constructor(props) {
    super(props);

    this.state = this.getInitialData(props);

    this.props.sdk.field.setValue(this.state);
  }

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(
      this.onExternalChange
    );
  }

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  getInitialData = props => {
    const value = props.sdk.field.getValue();

    if (!value) {
      return {
        tableData: [
          ['', '', ''],
          ['', '', ''],
        ],
      };
    }

    return value;
  }

  onExternalChange = value => {
    if (value) {
      this.setState({
        value,
      });
    }
  };

  handleCellChange = (e, row, column) => {
    const value = e.target.value;
    const newData = [...this.state.tableData];

    newData[row][column] = value;

    this.updateTable(newData);
  }

  handleAddRowClick = () => {
    const { tableData } = this.state;

    const newData = [ ...tableData ];
    newData.push(Array.from(newData[0], () => ''));

    this.updateTable(newData);
  }

  handleDeleteRowClick = index => {
    const { tableData } = this.state;

    const newData = [ ...tableData ];
    newData.splice(index, 1);

    this.updateTable(newData);
  }

  handleAddColumnClick = () => {
    const { tableData } = this.state;

    const newData = [ ...tableData ];
    newData.forEach(row => {
      row.push('');
    });

    this.updateTable(newData);
  }

  handleDeleteColumnClick = index => {
    const { tableData } = this.state;

    const newData = [ ...tableData ];
    newData.forEach(row => {
      row.splice(index, 1);
    });

    this.updateTable(newData);
  }

  updateTable = newTableData => {
    this.setState({
      tableData: newTableData,
    });

    this.props.sdk.field.setValue({ tableData: newTableData })
  }

  render() {
    const { tableData } = this.state;

    return (
      <Table>

        <TableHead>
          <TableRow>
            { tableData[0].map((cell, columnIndex) => this.renderHeaderRow(columnIndex)) }

            <TableCell>
              <IconButton
                className='Btn-addColumn'
                iconProps={ {
                  icon: 'Plus'
                } }
                onClick={ this.handleAddColumnClick }
              />
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          { tableData.map((row, rowIndex) => {
            // Skip the first row, because it's used for the header.
            if (rowIndex === 0) {
              return null;
            }

            return this.renderBodyRow(row, rowIndex);
          }) }
          <TableRow>
            <TableCell>
              <IconButton
                className='Btn-addRow'
                iconProps={ {
                  icon: 'Plus'
                } }
                onClick={ this.handleAddRowClick }
              />
            </TableCell>
          </TableRow>
        </TableBody>

      </Table>
    );
  }

  renderHeaderRow = columnIndex => {
    const { tableData } = this.state;

    return (
      <TableCell key={ columnIndex }>
        <TextInput
          width='small'
          type='text'
          onChange={ evt => this.handleCellChange(evt, 0, columnIndex) }
          value={ tableData[0][columnIndex] }
        />
        <IconButton
          className='Btn-deleteColumn'
          iconProps={ {
            icon: 'Close'
          } }
          onClick={ () => this.handleDeleteColumnClick(columnIndex) }
        />
      </TableCell>
    );
  }

  renderBodyRow = (row, rowIndex) => {
    const { tableData } = this.state;

    return (
      <TableRow key={ rowIndex }>
        { row.map((cell, columnIndex) => (
          <TableCell key={ columnIndex }>
            <TextInput
              width='small'
              type='text'
              onChange={ evt => this.handleCellChange(evt, rowIndex, columnIndex) }
              value={ tableData[rowIndex][columnIndex] }
            />
          </TableCell>
        )) }
        <TableCell>
          <IconButton
            className='Btn-deleteRow'
            iconProps={ {
              icon: 'Close'
            } }
            onClick={ () => this.handleDeleteRowClick(rowIndex) }
          />
        </TableCell>
      </TableRow>
    );
  }
}

init(sdk => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
