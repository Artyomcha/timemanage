// routes/kahban.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useActionData, useLoaderData, redirect, Form } from "react-router";

type Item = {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "inprogress" | "done";
  startDate: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Получаем cookie из браузерного запроса
    const cookie = request.headers.get("Cookie") || "";
    
    console.log("🍪 Loader cookie:", cookie);

    const res = await fetch("http://localhost:3000/api/items", {
      headers: {
        "Cookie": cookie, // Передаем cookie в backend
      },
    });

    if (res.status === 401) {
      // Если не авторизован, редирект на login
      return redirect("/login");
    }

    if (!res.ok) {
      return { items: [], error: "Failed to get items" };
    }

    const data = await res.json();
    return { items: data.items };
  } catch (err: any) {
    return { items: [], error: err.message || "Network error" };
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const cookie = request.headers.get("Cookie") || "";
  
  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const status = formData.get("status")?.toString() || "";
  const startDate = formData.get("startDate")?.toString() || "";

  if (!title || !status) {
    return { error: "Title and status is required" };
  }

  try {
    const res = await fetch("http://localhost:3000/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie, // Передаем cookie в backend
      },
      body: JSON.stringify({
        title,
        description,
        status,
        startDate: startDate || new Date().toISOString()
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Failed to create item" };
    }

    return redirect("/kahban");
  } catch (err) {
    console.error("Error: ", err);
    return { error: "Failed to connect to server" };
  }
}

export default function Kahban() {
  const { items = [], error } = useLoaderData<{ items: Item[]; error?: string }>();
  const actionData = useActionData<{ error?: string }>();

  const todo = items.filter(item => item.status === "todo");
  const inProgress = items.filter(item => item.status === "inprogress");
  const done = items.filter(item => item.status === "done");

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      <div className="col-span-3 mb-4">
        {actionData?.error && (
          <div className="text-red-500 mb-2">{actionData.error}</div>
        )}
        <Form method="post" className="flex gap-2">
          <input
            name="title"
            placeholder="Task title"
            className="border p-2 rounded flex-1"
            required
          />
          <input
            name="description"
            placeholder="Description"
            className="border p-2 rounded flex-1"
          />
          <select name="status" className="border p-2 rounded">
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Task
          </button>
        </Form>
      </div>

      <div>
        <p className="font-bold mb-2 text-lg">TO DO</p>
        {todo.map(item => (
          <KahbanCard key={item.id} item={item} />
        ))}
      </div>

      <div>
        <p className="font-bold mb-2 text-lg">IN PROGRESS</p>
        {inProgress.map(item => (
          <KahbanCard item={item} key={item.id} />
        ))}
      </div>

      <div>
        <p className="font-bold mb-2 text-lg">DONE</p>
        {done.map(item => (
          <KahbanCard item={item} key={item.id} />
        ))}
      </div>
    </div>
  );
}

function KahbanCard({ item }: { item: Item }) {
  return (
    <div className="border p-3 mb-2 bg-white rounded shadow-sm">
      <h3 className="font-semibold">{item.title}</h3>
      {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
      <p className="text-xs text-gray-400 mt-1">
        {new Date(item.startDate).toLocaleDateString()}
      </p>

      <div className="mt-2 flex gap-2">
        <Form method="post" action={`/update/${item.id}`} className="flex gap-1">
          <select
            name="status"
            defaultValue={item.status}
            className="border p-1 text-sm rounded"
          >
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button type="submit" className="bg-green-500 text-white px-2 py-1 text-sm rounded">
            Update
          </button>
        </Form>

        <Form method="post" action={`/delete/${item.id}`}>
          <button type="submit" className="bg-red-500 text-white px-2 py-1 text-sm rounded">
            Delete
          </button>
        </Form>
      </div>
    </div>
  );
}