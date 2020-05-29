import React from 'react';
import style from './style.css';
import { TodoActions } from 'app/actions/todos';
import { TodoItem } from '../TodoItem';
import { TodoModel } from 'app/models/TodoModel';
import { useXEvents } from '../../../xfeature';

export namespace TodoList {
  export interface Props {
    todos: TodoModel[];
    actions: TodoActions;
  }
}

export const TodoList = ({ todos, actions }: TodoList.Props): JSX.Element => {
  const xevents = useXEvents();
  const hasIncompleted = React.useMemo(() => todos.some((todo) => !todo.completed), []);
  return (
    <section className={style.main}>
      {hasIncompleted && (
        <input
          className={style.toggleAll}
          type="checkbox"
          checked={hasIncompleted}
          onChange={() => {
            xevents.clickBy({el: 'complete-all'})
            actions.completeAll();
          }}
        />
      )}
      <ul className={style.normal}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            completeTodo={actions.completeTodo}
            deleteTodo={actions.deleteTodo}
            editTodo={actions.editTodo}
          />
        ))}
      </ul>
    </section>
  );
};
