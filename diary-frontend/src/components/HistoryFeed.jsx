import { useState, useEffect } from "react"
import { getHistory } from "../api.js"
import HistoryItem from "./HistoryItem.jsx"

export default function HistoryFeed() {
    const [items, setItems] = useState([])

    useEffect(() => {
        getHistory().then(setItems)
    }, [])

    return (
        <div>
            <h2>История</h2>
            {items.length === 0 && <p>История пуста</p>}
            {items.map((item, index) => (
                <HistoryItem key={index} item={item} />
            ))}
        </div>
    )
}
