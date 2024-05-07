function createElement(tag, attributes, children, ...callbacks) {
    const element = document.createElement(tag);

    if (attributes) {
        Object.keys(attributes).forEach((key) => {
            element.setAttribute(key, attributes[key]);
        });
    }

    if (Array.isArray(children)) {
        children.forEach((child) => {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    } else if (typeof children === "string") {
        element.appendChild(document.createTextNode(children));
    } else if (children instanceof HTMLElement) {
        element.appendChild(children);
    }

    callbacks.forEach(callback => {
        const [eventName, eventCallback] = callback;
        element.addEventListener(eventName, eventCallback.bind(this));
    });

    return element;
}

class Component {
    constructor() {
        this._domNode = null;
    }

    getDomNode() {
        this._domNode = this.render();
        return this._domNode;
    }

    update() {
        const newDomNode = this.render();
        this._domNode.parentNode.replaceChild(newDomNode, this._domNode);
        this._domNode = newDomNode;
    }
}

class AddTask extends Component {
    constructor(onAddTask) {
        super();
        this.state = {}
        this.onAddTask = onAddTask;
    }

    render() {
        return createElement("div", {class: "add-todo"}, [
            createElement("input", {
                id: "new-todo",
                type: "text",
                placeholder: "Задание",
            }, {}, ["input", this.onAddInputChange.bind(this)]),
            createElement("button", {id: "add-btn"}, "+", [
                "click",
                () => this.onAddTask(this.state.inputState),
            ]),
        ]);
    }

    onAddInputChange() {
        this.state.inputState = document.getElementById("new-todo").value;
        console.log(this.state.inputState);
    }
}

class Task extends Component {
    constructor(task, toggleTask, deleteTask) {
        super();
        this.task = task;
        this.toggleTask = toggleTask;
        this.deleteTask = deleteTask;
    }

    render() {
        const attr = {
            type: "checkbox",
        };
        if (this.task.completed)
            attr.checked = "";
        return createElement("li", {key: this.task.id}, [
            createElement("input", attr, {}, ["change", this.toggleTask]),
            createElement(
                "label",
                {style: this.task.completed ? "color: gray" : ""},
                this.task.text
            ),
            createElement("button", {style: this.task.willBeDeleted ? "background-color: red" : ""}, "🗑", ["click", this.deleteTask]),
        ]);
    }
}

class TodoList extends Component {
    constructor() {
        super();
        this.state = {
            tasks: [
                {id: 1, text: "Сделать домашку", completed: false, willBeDeleted: false},
                {id: 2, text: "Сделать практику", completed: false, willBeDeleted: false},
                {id: 3, text: "Пойти домой", completed: false, willBeDeleted: false},
            ],
            inputState: "",
        };
    }

    onAddTask(text) {
        this.state.tasks.push({
            id: this.state.tasks.length + 1,
            text: text,
            completed: false,
        });
        this.update();
    }

    toggleTask(index) {
        this.state.tasks[index].completed = !this.state.tasks[index].completed;
        this.update();
    }

    deleteTask(task) {
        const index = this.state.tasks.findIndex((t) => t.id === task.id);
        if (this.state.tasks.at(index).willBeDeleted) {
            this.state.tasks.splice(index, 1);
        } else {
            this.state.tasks.at(index).willBeDeleted = true;
        }
        this.update();
    }

    render() {
        return createElement("div", {class: "todo-list"}, [
            createElement("h1", {}, "TODO List"),
            new AddTask(this.onAddTask.bind(this)).getDomNode(),
            createElement("ul", {id: "todos"}, this.state.tasks.map((task, index) => {
                return new Task(task, this.toggleTask.bind(this, index), this.deleteTask.bind(this, task)).getDomNode();
            })),
        ]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});