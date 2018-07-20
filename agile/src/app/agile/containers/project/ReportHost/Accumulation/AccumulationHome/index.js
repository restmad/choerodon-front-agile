import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Icon, DatePicker, Popover, Dropdown, Menu, Modal, Form, Select, Checkbox, Spin } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import moment from 'moment';
import ReactEcharts from 'echarts-for-react';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import AccumulationStore from '../../../../../stores/project/accumulation/AccumulationStore';
import AccumulationFilter from '../AccumulationComponent/AccumulationFilter';
import './AccumulationHome.scss';
import '../../BurndownChart/BurndownChartHome/BurndownChartHome.scss';
import '../../../../main.scss';
import txt from '../test';

const { AppState } = stores;
const { RangePicker } = DatePicker;
const Option = Select.Option;

@observer
class AccumulationHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeVisible: false,
      reportVisible: false,
      filterList: [],
      columnDatas: [],
      timeId: '',
      startDate: '',
      endDate: '',
      boardList: [],
      options: {},
      options2: {},
      optionsVisible: false,
      sprintData: {},
      loading: false,
    };
  }
  componentWillMount() {
    AccumulationStore.axiosGetFilterList().then((data) => {
      const newData = _.clone(data);
      _.forEach(newData, (item, index) => {
        newData[index].check = false;
      });
      AccumulationStore.setFilterList(newData);
      ScrumBoardStore.axiosGetBoardList().then((res) => {
        const newData2 = _.clone(res);
        let newIndex;
        _.forEach(newData2, (item, index) => {
          if (item.userDefault) {
            newData2[index].check = true;
            newIndex = index;
          } else {
            newData2[index].check = false;
          }
        });
        AccumulationStore.setBoardList(newData2);
        this.getColumnData(res[newIndex].boardId, true);
      }).catch((error) => {
      });
      // this.getData();
    }).catch((error) => {
    });
  }
  getColumnData(id, type) {
    ScrumBoardStore.axiosGetBoardData(id, 0, false, []).then((res2) => {
      const data2 = res2.columnsData.columns;
      _.forEach(data2, (item, index) => {
        data2[index].check = true;
      });
      this.setState({
        sprintData: res2.currentSprint,
      });
      AccumulationStore.setColumnData(data2);
      AccumulationStore.axiosGetProjectInfo().then((res) => {
        AccumulationStore.setProjectInfo(res);
        AccumulationStore.setStartDate(moment(res.creationDate.split(' ')[0]));
        if (type) {
          this.getData();
        }
      }).catch((error) => {
      });
    }).catch((error) => {
    });
  }
  getData() {
    this.setState({
      loading: true,
    });
    const columnData = AccumulationStore.getColumnData;
    const endDate = AccumulationStore.getEndDate.format('YYYY-MM-DD HH:mm:ss');
    const filterList = AccumulationStore.getFilterList;
    const startDate = AccumulationStore.getStartDate.format('YYYY-MM-DD HH:mm:ss');
    const columnIds = [];
    const quickFilterIds = [];
    let boardId;
    _.forEach(AccumulationStore.getBoardList, (bi) => {
      if (bi.check) {
        boardId = bi.boardId;
      }
    });
    _.forEach(columnData, (cd) => {
      if (cd.check) {
        columnIds.push(cd.columnId);
      }
    });
    _.forEach(filterList, (fl) => {
      if (fl.check) {
        quickFilterIds.push(fl.filterId);
      }
    });
    AccumulationStore.axiosGetAccumulationData({
      columnIds,
      endDate,
      quickFilterIds,
      startDate,
      boardId,
    }).then((res) => {
      AccumulationStore.setAccumulationData(res);
      this.setState({
        loading: false,
      });
      this.getOption();
    }).catch((error) => {
      this.setState({
        loading: false,
      });
    });
  }
  getOption() {
    const data = _.clone(AccumulationStore.getAccumulationData);
    const legendData = [];
    _.forEach(data, (item) => {
      legendData.push({
        icon: 'rect',
        name: item.name,
      });
    });
    const newxAxis = [];
    if (data.length > 0) {
      _.forEach(data[0].coordinateDTOList, (item) => {
        if (newxAxis.length === 0) {
          newxAxis.push(item.date.split(' ')[0]);
        } else if (newxAxis.indexOf(item.date.split(' ')[0]) === -1) {
          newxAxis.push(item.date.split(' ')[0]);
        }
      });
    }
    const legendSeries = [];
    _.forEach(data.reverse(), (item, index) => {
      legendSeries.push({
        name: item.name,
        type: 'line',
        stack: true,
        areaStyle: { normal: {
          color: item.color,
        } },
        lineStyle: { normal: {
          color: item.color,
        } },
        itemStyle: {
          normal: { color: item.color },
        },
        data: [],
      });
      _.forEach(newxAxis, (item2) => {
        let date = '';
        let max = 0;
        _.forEach(item.coordinateDTOList, (item3) => {
          if (item3.date.split(' ')[0] === item2) {
            if (date === '') {
              date = item3.date;
              max = item3.issueCount;
            } else if (moment(item3.date).isAfter(date)) {
              date = item3.date;
              max = item3.issueCount;
            }
          }
        });
        legendSeries[index].data.push(max);
      });
    });
    this.setState({
      options: {
        tooltip: {
          trigger: 'axis',
          // axisPointer: {
          //   type: 'cross',
          //   label: {
          //     backgroundColor: '#6a7985',
          //   },
          // },
        },
        legend: {
          right: '0%',
          data: legendData,
        },
        grid: {
          left: '3%',
          right: '3%',
          containLabel: true,
        },
        // toolbox: {
        //   left: 'left',
        //   feature: {
        //     restore: {},
        //     // dataZoom: {
        //     //   yAxisIndex: 'none',
        //     // },
        //   },
        // },
        xAxis: [
          {
            name: '日期',
            type: 'category',
            boundaryGap: false,
            data: newxAxis,
          },
        ],
        yAxis: [
          {
            name: '问题数',
            type: 'value',
          },
        ],
        series: legendSeries,
        dataZoom: [{
          startValue: newxAxis[0],
          type: 'slider',
          handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%',
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          },
          // right: '50%',
          // left: '0%',
        }],
      },
      optionsVisible: false,
    });
  }
  getTimeType(data, type, array) {
    let result;
    if (array) {
      result = [];
    }
    _.forEach(data, (item) => {
      if (item.check) {
        if (array) {
          result.push(String(item[type]));
        } else {
          result = item[type];
        }
      }
    });
    return result;
  }
  handleClick(e) {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    if (e.key === '0') {
      history.push(`/agile/reporthost/burndownchart?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
    }
    if (e.key === '1') {
      history.push(`/agile/reporthost/sprintreport?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
    }
    if (e.key === '2') {
      history.push(`/agile/reporthost/versionReport?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
    }
  }
  setStoreCheckData(data, id, params, array) {
    const newData = _.clone(data);
    _.forEach(newData, (item, index) => {
      if (array) {
        if (id.indexOf(String(item[params])) !== -1) {
          newData[index].check = true;
        } else {
          newData[index].check = false;
        }
      } else if (String(item[params]) === String(id)) {
        newData[index].check = true;
      } else {
        newData[index].check = false;
      }
    });
    return newData;
  }
  getFilterData() {
    return [{
      data: AccumulationStore.getBoardList,
      onChecked: id => String(this.getTimeType(AccumulationStore.getBoardList, 'boardId')) === String(id),
      onChange: (id, bool) => {
        AccumulationStore.setBoardList(this.setStoreCheckData(AccumulationStore.getBoardList, id, 'boardId'));
        this.getColumnData(id, true);
      },
      id: 'boardId',
      text: '看板',
    }, {
      data: AccumulationStore.getColumnData,
      onChecked: id => this.getTimeType(AccumulationStore.getColumnData, 'columnId', 'array').indexOf(String(id)) !== -1,
      onChange: (id, bool) => {
        AccumulationStore.changeColumnData(id, bool);
        this.getData();
      },
      id: 'columnId',
      text: '列',
    }, {
      data: AccumulationStore.getFilterList,
      onChecked: id => this.getTimeType(AccumulationStore.getFilterList, 'filterId', 'array').indexOf(String(id)) !== -1,
      onChange: (id, bool) => {
        AccumulationStore.changeFilterData(id, bool);
        this.getData();
      },
      id: 'filterId',
      text: '快速搜索',
    }];
  }
  // handleOnBrushSelected(params) {
  // }
  render() {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    const menu = (
      <Menu onClick={this.handleClick.bind(this)}>
        <Menu.Item key="0">
        燃尽图
        </Menu.Item>
        <Menu.Item key="1">
        Sprint报告
        </Menu.Item>
        <Menu.Item key="2">
        版本报告
        </Menu.Item>
      </Menu>
    );
    return (
      <Page>
        <Header
          title="累积流量图"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <Button funcType="flat" onClick={() => { this.getData(); }}>
            <Icon type="refresh" />刷新
          </Button>
          <Dropdown placement="bottomCenter" trigger={['click']} overlay={menu}>
            <Button icon="arrow_drop_down" funcType="flat">
              切换报表
            </Button>
          </Dropdown>
        </Header>
        <Content
          title="累积流量图"
          description="显示状态的问题。这有助于您识别潜在的瓶颈, 需要对此进行调查。"
          link="#"
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Spin spinning={this.state.loading}>
            <div className="c7n-accumulation-filter">
              <RangePicker
                value={[moment(AccumulationStore.getStartDate), moment(AccumulationStore.getEndDate)]}
                allowClear={false}
                onChange={(date, dateString) => {
                  AccumulationStore.setStartDate(moment(dateString[0]));
                  AccumulationStore.setEndDate(moment(dateString[1]));
                  this.getData();
                }}
              />
              {
                this.getFilterData().map((item, index) => (
                  <Popover
                    placement="bottom"
                    trigger="click"
                    content={(
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {
                          item.data.map(items => (
                            <Checkbox
                              checked={item.onChecked(items[item.id])}
                              onChange={(e) => {
                                item.onChange(items[item.id], e.target.checked);
                              }}
                            >
                              {items.name}
                            </Checkbox>
                          ))
                        }
                      </div>
                    )}
                  >
                    <Button 
                      style={{ 
                        marginLeft: index === 0 ? 20 : 0, 
                        color: '#3F51B5', 
                      }}
                    >
                      {item.text}
                      <Icon type="baseline-arrow_drop_down" />
                    </Button>
                  </Popover>
                ))
              }
              {
                this.state.optionsVisible ? (
                  <AccumulationFilter
                    visible={this.state.optionsVisible}
                    getTimeType={this.getTimeType.bind(this)}
                    getColumnData={this.getColumnData.bind(this)}
                    getData={this.getData.bind(this)}
                    onCancel={() => {
                      this.getColumnData(this.getTimeType(AccumulationStore.getBoardList, 'boardId'));
                      this.setState({
                        optionsVisible: false,
                      });
                    }}
                  />
                ) : ''
              }
            </div>
            <div className="c7n-accumulation-report" style={{ flexGrow: 1, height: '100%' }}>
              <ReactEcharts
                ref={(e) => { this.echarts_react = e; }}
                option={this.state.options}
                style={{
                  height: '600px',
                }}
                notMerge
                lazyUpdate
              />
            </div>
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default Form.create()(AccumulationHome);

