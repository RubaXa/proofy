import React, { useState } from 'react';
import classNames from 'classnames';
import style from './style.css';
import { TodoModel } from 'app/models';
import { TodoActions } from 'app/actions';
import { TodoTextInput } from '../TodoTextInput';
import { useXEvents } from '../../../xfeature';

export namespace TodoItem {
  export interface Props {
    todo: TodoModel;
    editTodo: typeof TodoActions.editTodo;
    deleteTodo: typeof TodoActions.deleteTodo;
    completeTodo: typeof TodoActions.completeTodo;
  }
}

export const TodoItem = ({ todo, editTodo, deleteTodo, completeTodo }: TodoItem.Props) => {
  const xevents = useXEvents();
  const [editing, setEditing] = useState(false);

  const handleDoubleClick = React.useCallback(() => {
    xevents.todoItem.edit({act: 'start'});
    setEditing(true);
  }, [setEditing]);

  const handleSave = React.useCallback(
    (id: number, text: string) => {
      xevents.todoItem.edit({act: 'end'});
      if (text.length === 0) {
        xevents.todoItem.delete({});
        deleteTodo(id);
      } else {
        editTodo({ id, text });
      }
      setEditing(false);
    },
    [editTodo, deleteTodo, setEditing]
  );

  const classes = classNames({
    [style.completed]: todo.completed,
    [style.editing]: editing,
    [style.normal]: !editing
  });

  return (
    <li className={classes}>
      {editing ? (
        <TodoTextInput
          value={todo.text}
          onSave={(text) => { todo.id && handleSave(todo.id, text)}}
        />
      ) : (
        <div className={style.view}>
          <input
            type="checkbox"
            className={style.toggle}
            checked={todo.completed}
            onChange={() => {
              if (todo.id) {
                xevents.todoItem.complete({state: todo.completed ? 'no' : 'yes'});
                completeTodo(todo.id)
              }
            }}
          />
          <label onDoubleClick={() => handleDoubleClick()}>{todo.text}</label>
          <button
            className={style.destroy}
            onClick={() => {
              if (todo.id) {
                deleteTodo(todo.id);
                xevents.todoItem.delete({});
              }
            }}
          />
        </div>
      )}
    </li>
  );
};
