import { Meteor } from 'meteor/meteor'
import React, { useState } from 'react'
import { useTracker } from 'meteor/react-meteor-data'
import { TasksCollection } from '../api/TasksCollection.js'

import { Task } from './Task.jsx'
import { TaskForm } from './TaskForm.jsx'
import { LoginForm } from './LoginForm'

const toggleChecked = ({ _id, isChecked }) => {
  Meteor.call('tasks.setIsChecked', _id, !isChecked)
}

const deleteTask = ({ _id }) => Meteor.call('tasks.remove', _id)

export const App = () => {
  const [hideCompleted, setHideCompleted] = useState(false)
  const hideCompletedFilter = { isChecked: { $ne: true } }
  const user = useTracker(() => Meteor.user())
  const userFilter = user ? { userId: user._id } : {}

  const pendingOnlyFilter = { ...hideCompletedFilter, ...userFilter }

  const tasks = useTracker(() => {
    if (!user) {
      return []
    }

    return TasksCollection.find(
      hideCompleted ? pendingOnlyFilter : userFilter,
      {
        sort: { createdAt: -1 },
      }
    ).fetch()
  })

  const pendingTasksCount = useTracker(() => {
    if (!user) {
      return 0
    }

    return TasksCollection.find(pendingOnlyFilter).count()
  })

  const logout = () => Meteor.logout()

  return (
    <div className="app">
      <header>
        <div className="app-bar">
          <div className="app-header">
            <h1>📝️ To Do List {pendingTasksCount}</h1>
          </div>
        </div>
      </header>

      <div className="main">
        {user ? (
          <>
            <div className="user" onClick={logout}>
              {user.username ||
                user.profile.name ||
                user.services.github.username}
              🚪
            </div>
            <TaskForm user={user} />

            <div className="filter">
              <button onClick={() => setHideCompleted(!hideCompleted)}>
                {hideCompleted ? 'Show All' : 'Hide Completed'}
              </button>
            </div>

            <ul className="tasks">
              {tasks.map(task => (
                <Task
                  key={task._id}
                  task={task}
                  onCheckboxClick={toggleChecked}
                  onDeleteClick={deleteTask}
                />
              ))}
            </ul>
          </>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  )
}
