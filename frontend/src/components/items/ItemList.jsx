import ItemCard from "./ItemCard";

const ItemList = ({ items, onRequestSuccess }) => {
  if (!items?.length) {
    return (
      <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem" }}>
        No nearby items found.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.25rem",
      }}
    >
      {items.map((item, i) => (
        <div
          key={item._id}
          className="animate-fade-up"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <ItemCard item={item} onRequestSuccess={onRequestSuccess} />
        </div>
      ))}
    </div>
  );
};

export default ItemList;
