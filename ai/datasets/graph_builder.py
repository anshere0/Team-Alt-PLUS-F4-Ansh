import networkx as nx
import torch
from torch_geometric.data import Data
from torch_geometric.utils import from_networkx
import random
import numpy as np

def build_synthetic_grid_graph(num_substations=1, num_transformers=48, meters_per_transformer=10):
    """
    Builds a hierarchical synthetic grid:
    Substation -> Transformers -> Meters
    """
    G = nx.Graph()
    node_id = 0
    
    # Add substations
    substations = []
    for _ in range(num_substations):
        G.add_node(node_id, type="substation", x=[1.0, 0.0, 0.0]) # feature
        substations.append(node_id)
        node_id += 1
        
    # Add transformers
    transformers = []
    for i in range(num_transformers):
        G.add_node(node_id, type="transformer", x=[0.0, 1.0, 0.0])
        transformers.append(node_id)
        # Connect to a random substation
        sub = random.choice(substations)
        G.add_edge(sub, node_id)
        node_id += 1
        
    # Add meters
    meters = []
    for t in transformers:
        for _ in range(meters_per_transformer):
            # Normal meter feature
            meter_load = np.random.normal(50, 10)
            is_anomaly = random.random() < 0.05
            
            if is_anomaly:
                meter_load *= 0.1 # Bypass/Theft
                y = 1
            else:
                y = 0
                
            G.add_node(node_id, type="meter", x=[meter_load, 25.0, 60.0], y=y)
            G.add_edge(t, node_id)
            meters.append(node_id)
            node_id += 1
            
    # Convert to PyTorch Geometric Data
    # For a homogeneous GNN approach, we will just use the features 'x' and labels 'y'
    # NetworkX to PyG conversion
    
    # Extract features
    x = []
    y = []
    for n in G.nodes():
        node_data = G.nodes[n]
        x.append(node_data['x'])
        # Substation/Transformers don't have labels in this simple setup, we'll give them 0
        y.append(node_data.get('y', 0))
        
    x_tensor = torch.tensor(x, dtype=torch.float)
    y_tensor = torch.tensor(y, dtype=torch.long)
    
    # Extract edges
    edges = list(G.edges())
    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    # Make it undirected explicitly for message passing
    edge_index = torch.cat([edge_index, edge_index.flip(0)], dim=1)
    
    data = Data(x=x_tensor, edge_index=edge_index, y=y_tensor)
    
    # Create train mask for meters only
    train_mask = torch.zeros(data.num_nodes, dtype=torch.bool)
    for n in meters:
        train_mask[n] = True
    data.train_mask = train_mask
    
    return data

if __name__ == "__main__":
    data = build_synthetic_grid_graph()
    print(f"Graph created: {data.num_nodes} nodes, {data.num_edges} edges")
