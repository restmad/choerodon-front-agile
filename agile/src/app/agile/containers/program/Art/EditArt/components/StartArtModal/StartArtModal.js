import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'choerodon-ui';
import _ from 'lodash';
import moment from 'moment';

const propTypes = {
  visible: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

let canStart = true;

const renderPIName = (props) => {
  const { data: { piCodePrefix, piCodeNumber, piCount }, PiList } = props;
  const PiArr = PiList.sort((a, b) => a.id - b.id).map(item => <span key={item.name} style={{ marginRight: 5 }}>{`${item.code}-${item.name}`}</span>);
  if ((PiArr && PiArr.length > 0) || (piCount && piCodePrefix && piCodeNumber)) {
    const piCodeNumArr = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < piCount; i++) {
      piCodeNumArr.push(piCodeNumber + i);
    }
  
    const newPi = piCodeNumArr.map(codeNum => (
      <span key={codeNum} style={{ marginRight: 5 }}>{`${piCodePrefix}-${codeNum}`}</span>
    ));
    return [...PiArr, ...newPi];
  } else {
    return (
      <span>-</span>
    );
  }
};

// eslint-disable-next-line consistent-return
const renderStartArtModalContent = (props) => {
  const { data, artList, startArtShowInfo } = props;
  const doingArt = artList.find(item => item.statusCode === 'doing');
  const nonEmpty = Object.keys(_.pick(data, ['startDate', 'piCount', 'piCodePrefix', 'piCodeNumber', 'interationCount', 'interationWeeks', 'ipWeeks'])).every(key => data[key]);
  canStart = nonEmpty && !doingArt;
  if (doingArt) {
    return (
      <div>
        {` 你无法启动 ${data.name} ， `}
        <span style={{ color: 'red' }}>
          {doingArt.name}
        </span>
        {'  正在进行中，可以先停止进行中的火车，再开启新的火车。'}
      </div>
    );
  } else {
    return (
      <div>
        <p>
          {
            nonEmpty ? `你正在启动 ${data.name} ，当前没有正在进行的火车。` : `你无法启动 ${data.name} ，请你填写完相应字段再启动火车。`
          }
        </p>
        <div>
          {
            Object.keys(startArtShowInfo).map((key) => {
              if (key !== 'piName' && key !== 'startDate') {
                return (
                  <p key={key} style={{ marginBottom: 5 }}>
                    <span>{`${startArtShowInfo[key].name}：`}</span>
                    <span style={{ color: startArtShowInfo[key].empty ? 'red' : 'blue' }}>{data[key] || 0}</span>
                  </p>
                );
              } else if (key === 'startDate') {
                return (
                  <p key={key} style={{ marginBottom: 5 }}>
                    <span>{`${startArtShowInfo[key].name}：`}</span>
                    <span style={{ color: startArtShowInfo[key].empty ? 'red' : 'blue' }}>{moment(data[key]).format('YYYY-MM-DD') || '-'}</span>
                  </p>
                );
              } else {
                return (
                  <p key={key} style={{ marginBottom: 5 }}>
                    <span>{`${startArtShowInfo[key].name}：`}</span>
                    <span style={{ color: data.piCount && data.piCodePrefix && data.piCodeNumber ? 'blue' : 'red' }}>
                      {
                      renderPIName(props)
                    }
                    </span>
                   
                  </p>
                );
              }
            })
            }
        </div>
      </div>
    );
  }
};

const handleStartOk = (props) => {
  const { onOk } = props;
  onOk(canStart);
};

const StartArtModal = (props) => {
  const {
    visible, onCancel,
  } = props;
  return (
    <Modal
      title="启动火车"
      visible={visible}
      onOk={() => { handleStartOk(props); }}
      onCancel={onCancel}
    >
      <div style={{ marginTop: 20 }}>
        {renderStartArtModalContent(props)}
      </div>
    </Modal>
  );
};

StartArtModal.propTypes = propTypes;

export default StartArtModal;
