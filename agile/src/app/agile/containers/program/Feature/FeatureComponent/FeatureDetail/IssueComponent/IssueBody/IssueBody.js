import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import IssueDetail from './IssueDetail';
import IssueDes from './IssueDes';
import IssueAttachment from './IssueAttachment';
import IssueCommit from './IssueCommit';
import IssueLog from './IssueLog';
import IssueLink from './IssueLink';
import IssueWiki from './IssueWiki';

@inject('AppState', 'HeaderStore')
@observer class IssueBody extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {
      store, reloadIssue,
    } = this.props;
    const issue = store.getIssue;
    const { issueTypeDTO = {} } = issue;

    return (
      <div className="c7n-content-bottom" id="scroll-area" style={{ position: 'relative' }}>
        <section className="c7n-body-editIssue">
          <div className="c7n-content-editIssue">
            <IssueDetail {...this.props} />
            <IssueDes store={store} />
            <IssueAttachment store={store} reloadIssue={reloadIssue} />
            {issueTypeDTO.typeCode && issueTypeDTO.typeCode === 'issue_epic'
              ? <IssueWiki store={store} /> : ''
            }
            <IssueCommit store={store} reloadIssue={reloadIssue} />
            <IssueLog store={store} />
            {/* <IssueLink store={store} reloadIssue={reloadIssue} /> */}
          </div>
        </section>
      </div>
    );
  }
}

export default IssueBody;
