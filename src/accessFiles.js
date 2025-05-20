

import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig.js";

// Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

/**
 * Fetches all nodes from Firestore, builds a flat node list, and constructs a nested hierarchy.
 * Returns the root node.
 */
export async function fetchAndBuildTree() {
    // Fetch all nodes from Firestore
    const snapshot = await getDocs(collection(db, "nodes"));
    const flatNodes = [];

    snapshot.forEach((doc) => {
        const data = doc.data();
        flatNodes.push({
            id: data.id,
            body: data.body,
            children_order: data.children_order || [],
            index: data.index || 0,
            notes: data.notes || '',
            parent_id: data.parent_id || null,
            title: data.title,
            visible: data.visible !== false, // default to true if missing
        });
    });

    // Map of node id -> node object
    const nodeMap = {};
    flatNodes.forEach((node) => {
        node.children = [];
        nodeMap[node.id] = node;
    });

    // Assign children to parents according to parent_id
    flatNodes.forEach((node) => {
        const parentId = node.parent_id;
        if (parentId && nodeMap[parentId]) {
            nodeMap[parentId].children.push(node);
        }
    });

    // Order children according to children_order for each node
    flatNodes.forEach((node) => {
        node.children = node.children_order
            .map((childId) => nodeMap[childId])
            .filter(Boolean);
    });

    // Return the root node
    return nodeMap["root"];
}