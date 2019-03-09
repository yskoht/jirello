'use strict';
import React, { Component } from 'react';
import { connect } from 'react-redux'
import Modal from 'react-modal';
import Board from 'react-trello';

import Button from '@material-ui/core/Button';

import NavigationBar from './navigation_bar';
import './App.css';
import {
  jiraGetAllProjects,
  jiraGetIssues,
  jiraFindUsersAssignable,
  jiraGetAllProject,
} from './actions';
import firebase from './firebase';

class App extends Component {
  constructor() {
    super();
    this.state = {
      modalIsOpen: false,
      account: null,
      assignee: [],
    };
    this.fetchIssues = {};
  }

  componentDidMount() {
    this.props.dispatch(jiraGetAllProject());
    firebase.auth().onAuthStateChanged(account => {
      this.setState({ account })
    });
  }

  componentDidUpdate() {
    const { projects, users, issues } = this.props.jira;
    if (projects && projects.length === 0) {
      return;
    }
    projects.forEach(proj => {
      if (users[proj.key]) {
        return;
      }
      this.props.dispatch(jiraFindUsersAssignable(proj.key));
    });

    projects.forEach(proj => {
      const prjIss = issues[proj.key];
      if (!prjIss) {
        if (this.fetchIssues[proj.key] === undefined) {
          this.props.dispatch(jiraGetIssues({project: proj.key, startAt: 0}));
          this.fetchIssues[proj.key] = 0;
        }
      } else if (prjIss.issues.length < prjIss.total) {
        if (this.fetchIssues[proj.key] === prjIss.startAt) {
          const startAt = prjIss.startAt + prjIss.maxResults;
          this.props.dispatch(jiraGetIssues({project: proj.key, startAt}));
          this.fetchIssues[proj.key] = startAt;
        }
      }
    });
  }

  onCardClick = (cardId, metadata, laneId) => {
    console.log(cardId, metadata, laneId);
  }

  openModal = (avatar) => {
    this.setState({modalIsOpen: true, avatar});
  }

  closeModal = () => {
    this.setState({modalIsOpen: false});
  }

  login = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }

  logout = () => {
    firebase.auth().signOut();
  }

  renderLoggin = () => {
    if (this.state.account) {
      return <Button onClick={this.logout}>Google LOGOUT</Button>
    } else {
      return <Button onClick={this.login}>Google LOGIN</Button>
    }
  }

  render() {
    return (
      <div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          contentLabel="Example Modal"
        >
          {this.state.avatar &&
            <div>
              <img src={this.state.avatar} />
              {this.state.avatar}
            </div>
          }
        </Modal>
        <NavigationBar
          title={'AppBar'}
          selected={this.state.assignee}
          onselect={event => this.setState({assignee: event.target.value})}
          button={this.renderLoggin()} />
        <Board
          data={this.props.board}
          draggable={true}
          laneDraggable={false}
          cardDraggable={true}
          onCardClick={this.onCardClick}
          onLaneScroll={this.onLaneScroll}
        />
      </div>
    );
  }
}

const createJiraLane = (state,issueStatus) => {
  const jira = state.jira;
  let cards = [];
  if (jira && jira.issues) {
    cards = jira.issues
      .filter(i => {
        return i.fields.status.name === issueStatus
      })
      .map(i => {
        return ({
          id: `${i.id}`,
          title: i.key,
          description: i.fields.summary,
          //description: d.avatar,
          //metadata: {avatar: d.avatar},
          //label: i.key,
          //tags: tags,
        });
      });
  }
  return {
    id: issueStatus,
    title: issueStatus,
    label: cards.length,
    cards: cards,
  };
}

function mapStateToProps(state) {
  console.log(state);
  return { ...state, board: {lanes: []}}
  //const jira = state.jira;
  //const lane2 = createJiraLane(state, 'BACKLOG');
  //const lane3 = createJiraLane(state, 'Doing');
  //const lane4 = createJiraLane(state, 'Review');
  //const lane5 = createJiraLane(state, 'CLOSE');
  /*
  return {
    board: {lanes: [lane2, lane3, lane4, lane5]},
    startAt: jira && jira.startAt,
    maxResults: jira && jira.maxResults,
    total: jira && jira.total,
    issues: jira && jira.issues,
  };
  */
}

export default connect(mapStateToProps)(App);
