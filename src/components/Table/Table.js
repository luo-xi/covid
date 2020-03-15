import React, { Component } from 'react';
import { Table, Input, Button } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import './Table.css';

class SortableTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
            searchedColumn: '',
            sortedInfo: null,
        };
        this.data = this.props.data.map((e, i) => {
            return {
                key: String(i),
                ...e
            };
        });
    }

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
            </Button>
                <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    Reset
            </Button>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        render: text =>
            this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[this.state.searchText]}
                    autoEscape
                    textToHighlight={text.toString()}
                />
            ) : (
                    text
                ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    handleChange = (pagination, filters, sorter) => {
        //console.log('Various parameters', pagination, filters, sorter);
        this.setState({
            sortedInfo: sorter,
        });
    };

    handleClick = (s) => {
        if(this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(()=>{
            const str = s.map((i) => {
                const e = this.data[Number(i)];
                return e.datakey;
            });
            this.props.handleSelection(s, str);
        }, 500);
    }

    render() {
        let { sortedInfo } = this.state;
        sortedInfo = sortedInfo || {};
        const columns = [{
            title: 'State',
            dataIndex: 'province',
            key: 'province',
            ...this.getColumnSearchProps('province'),
        }, {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            ...this.getColumnSearchProps('country'),
        }, {
            title: 'Confirmed',
            dataIndex: 'confirmed',
            key: 'confirmed',
            sorter: (a, b) => Number(a.confirmed) - Number(b.confirmed),
            sortOrder: sortedInfo.columnKey === 'confirmed' && sortedInfo.order,
            ellipsis: true
        }, {
            title: 'Deaths',
            dataIndex: 'deaths',
            key: 'deaths',
            sorter: (a, b) => Number(a.deaths) - Number(b.deaths),
            sortOrder: sortedInfo.columnKey === 'deaths' && sortedInfo.order,
            ellipsis: true,
        }, {
            title: 'Recovered',
            dataIndex: 'recovered',
            key: 'recovered',
            sorter: (a, b) => Number(a.recovered) - Number(b.recovered),
            sortOrder: sortedInfo.columnKey === 'recovered' && sortedInfo.order,
            ellipsis: true,
        }, {
            title: 'Active',
            dataIndex: 'hospitalised',
            key: 'hospitalised',
            sorter: (a, b) => Number(a.hispital) - Number(b.hispital),
            sortOrder: sortedInfo.columnKey === 'hospitalised' && sortedInfo.order,
            ellipsis: true,
        }];

        const rowSelection = {
          onChange: this.handleClick,
        };

        return (
            <div className="table-container">
                <Table columns={columns} dataSource={this.data} onChange={this.handleChange} rowSelection={rowSelection} />
            </div>
        )
    }
}

export default SortableTable;