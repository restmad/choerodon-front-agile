import React, { PureComponent } from 'react';

import {
  Select, DatePicker, Button, Modal, Tooltip,
} from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import moment from 'moment';
import { find, difference } from 'lodash';
import SelectFocusLoad from '../../../../../components/SelectFocusLoad';
import './AdvancedSearch.scss';

const { Option } = Select;
const { AppState } = stores;
const { RangePicker } = DatePicker;
const SelectStyle = {
  width: 120,
};

class AdvancedSearch extends PureComponent {
  saveList = (type, List) => {
    this[type] = List;
  }

  checkFilterEmpty = () => {
    const { searchDTO } = this.props;
    const { advancedSearchArgs, otherArgs, searchArgs } = searchDTO;
    const searches = { ...advancedSearchArgs, ...otherArgs, ...searchArgs };
    return !Object.keys(searches).some((key) => {
      const item = searches[key];
      return item.length !== 0;
    });
  }

  getValueFields = (searchDTO) => {
    const { advancedSearchArgs, otherArgs, searchArgs } = searchDTO;
    const searches = { ...advancedSearchArgs, ...otherArgs, ...searchArgs };
    const keys = Object.keys(searches).filter((key) => {
      const item = searches[key];
      return item.length !== 0;
    });
    const obj = {};
    keys.forEach((key) => {
      obj[key] = searches[key];
    });
    return obj;
  }

  filterSame = (obj, obj2) => {
    const keys1 = Object.keys(obj);
    const keys2 = Object.keys(obj2);    
    
    if (keys1.length !== keys2.length || difference(keys1, keys2).length > 0) {
      return false;
    } else {
      for (let i = 0; i < keys1.length; i += 1) {
        if (typeof obj[keys1[i]] === 'string' && obj[keys1[i]] !== obj2[keys1[i]]) {
          return false;
        } else if (difference(obj[keys1[i]], obj2[keys1[i]]).length > 0) {
          return false;
        }
      }
    }
    return true;
  }

  findSameFilter = () => {
    const { myFilters, searchDTO } = this.props;
    const hasValueFields = this.getValueFields(searchDTO);    
    return myFilters.find((filter) => {
      const { filterJson } = filter;
      const filterHasValueFields = this.getValueFields(JSON.parse(filterJson));  
      // console.log(filterHasValueFields, hasValueFields);    
      return this.filterSame(filterHasValueFields, hasValueFields);
    });
  }

  handleSelectChange = (type, values) => {
    const { onAdvancedSearchChange } = this.props;
    onAdvancedSearchChange(type, values);
    // switch
  }

  // 将searchDTO提取出选择框的值
  searchConvert = () => {
    const { searchDTO } = this.props;
    const { advancedSearchArgs } = searchDTO;
    const {
      assigneeIds, issueTypeId, priorityId, statusId,
    } = advancedSearchArgs;
    return advancedSearchArgs;
  }

  render() {
    const {
      myFilters, onSaveClick, onManageClick, onSelectMyFilter, onClearFilter, selectedFilter,
    } = this.props;
    const SelectValue = this.searchConvert();
    const isFilterEmpty = this.checkFilterEmpty();
    const filterExist = isFilterEmpty ? undefined : this.findSameFilter();    
    // console.log(filterExist);
    return (
      <div className="c7nagile-AdvancedSearch">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Select
            allowClear
            style={SelectStyle}
            dropdownMatchSelectWidth={false}
            placeholder="我的筛选"
            filter
            optionFilterProp="children"
            onChange={onSelectMyFilter}
            value={filterExist ? filterExist.filterId : selectedFilter}            
            getPopupContainer={triggerNode => triggerNode.parentNode}
          >
            {
              myFilters.length && myFilters.map(item => (
                <Option key={item.filterId} value={item.filterId} title={item.name}>{item.name}</Option>
              ))
            }
          </Select>

          <Select
            className="SelectTheme"
            mode="multiple"
            allowClear
            style={SelectStyle}
            dropdownMatchSelectWidth={false}
            placeholder="问题类型"
            labelInValue
            maxTagCount={0}
            maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
            onChange={this.handleIssueTypeSelectChange}

            getPopupContainer={triggerNode => triggerNode.parentNode}
          >
            {/* {
                issueTypes.length && issueTypes.map(item => (
                  <Option key={item.id} value={item.id} title={item.name}>{item.name}</Option>
                ))
              } */}
          </Select>

          <SelectFocusLoad
            className="SelectTheme"
            mode="multiple"
            type="status_program"
            allowClear
            filter={false}
            loadWhenMount
            style={SelectStyle}
            dropdownMatchSelectWidth={false}
            placeholder="状态"
            saveList={this.saveList.bind(this, 'statusList')}
            maxTagCount={0}
            optionLabelProp="name"
            maxTagPlaceholder={ommittedValues => `${ommittedValues.map(value => find(this.statusList, { id: value }).name).join(', ')}`}
            onChange={this.handleSelectChange.bind(this, 'statusList')}
            value={SelectValue.statusList}
            render={status => <Option value={status.id}>{status.name}</Option>}
            getPopupContainer={triggerNode => triggerNode.parentNode}
          />

          <Select
            className="SelectTheme"
            mode="multiple"
            style={SelectStyle}
            dropdownMatchSelectWidth={false}
            allowClear
            placeholder="优先级"
            labelInValue
            maxTagCount={0}
            maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
            onChange={this.handleSelectChange}
            // value={_.map(selectedPriority, key => (
            //   {
            //     key,
            //     name: _.map(prioritys, item => item.id === key).name,
            //   }
            // ))}
            getPopupContainer={triggerNode => triggerNode.parentNode}
          >
            {/* {
                prioritys.length && prioritys.map(item => (
                  <Option key={item.id} value={item.id} title={item.name}>{item.name}</Option>
                ))
              } */}
          </Select>

          <SelectFocusLoad
            className="SelectTheme"
            type="user"
            loadWhenMount
            mode="multiple"
            allowClear
            style={SelectStyle}
            dropdownMatchSelectWidth={false}
            placeholder="经办人"
            saveList={this.saveList.bind(this, 'assigneeList')}
            maxTagCount={0}
            maxTagPlaceholder={ommittedValues => `${ommittedValues.map(value => find(this.assigneeList, { id: value }).realName).join(', ')}`}
            onChange={this.handleSelectChange.bind(this, 'assigneeIds')}
            value={SelectValue.assigneeIds}
            getPopupContainer={triggerNode => triggerNode.parentNode}
            render={user => <Option value={user.id}>{user.realName}</Option>}
          />

          {/* {
              (moment(createStartDate).format('YYYY-MM-DD') === moment(projectInfo.creationDate).format('YYYY-MM-DD') || createStartDate === '') && (moment(createEndDate).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') || createEndDate === '') ? (
                <div className="c7n-createRange">
                  <RangePicker
                    format="YYYY-MM-DD hh:mm:ss"
                    defaultPickerValue={[moment().subtract(1, 'months'), moment()]}
                    disabledDate={current => current && (current > moment().endOf('day') || current < moment(projectInfo.creationDate).startOf('day'))}
                    allowClear
                    onChange={this.handleCreateDateRangeChange}
                    placeholder={['创建时间', '']}
                  />
                </div>
              ) : (
                <Tooltip title={`创建问题时间范围为${moment(createStartDate).format('YYYY-MM-DD')} ~ ${moment(createEndDate).format('YYYY-MM-DD')}`}>
                  <div className="c7n-createRange">
                    <RangePicker
                      value={[createStartDate && moment(createStartDate), createEndDate && moment(createEndDate)]}
                      format="YYYY-MM-DD hh:mm:ss"
                      disabledDate={current => current && (current > moment().endOf('day') || current < moment(projectInfo.creationDate).startOf('day'))}
                      allowClear
                      onChange={this.handleCreateDateRangeChange}
                      placeholder={['创建时间', '']}
                    />
                  </div>
                </Tooltip>
              )
            } */}

        </div>
        <div className="c7n-mySearchManage">
          {
            !isFilterEmpty && (
              <Button
                funcType="raised"
                style={{ color: '#fff', background: '#3F51B5', marginRight: 10 }}
                onClick={onClearFilter}
              >
                {'清空筛选'}
              </Button>
            )
          }
          {
            !filterExist && (
              <Button
                funcType="raised"
                style={{ color: '#fff', background: '#3F51B5', marginRight: 10 }}
                onClick={onSaveClick}
              >
                {'保存筛选'}
              </Button>
            )
          }
          {myFilters && myFilters.length > 0 && (
            <Button
              funcType="flat"
              style={{ color: '#3F51B5' }}
              onClick={onManageClick}
            >
              {'筛选管理'}
            </Button>
          )}
        </div>
      </div>

    );
  }
}

export default AdvancedSearch;
