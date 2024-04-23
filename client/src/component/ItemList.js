import { Link } from "react-router-dom";

export const ItemList = ({ items }) => {
  if (!items) {
    return <p>Loading items...</p>;
  }

  if (items.err) {
    return <p>{items.err}</p>;
  }

  return (
    <div>
      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items to display</p>
      ) : (
        items.map((i) => {
          return (
            <li key={i}>
              <Link to={`/items/${i}`}>{i}</Link>
            </li>
          );
        })
      )}
    </div>
  );
};
