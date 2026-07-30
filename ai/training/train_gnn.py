import torch
import torch.nn.functional as F
from datasets.graph_builder import build_synthetic_grid_graph
from models.gnn_loss_detector import GridGraphSAGE
import os

def train_gnn():
    print("Building Synthetic Grid Graph...")
    data = build_synthetic_grid_graph()
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    model = GridGraphSAGE().to(device)
    data = data.to(device)
    
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)
    
    print("Training GridGraphSAGE Model...")
    model.train()
    for epoch in range(100):
        optimizer.zero_grad()
        out = model(data.x, data.edge_index)
        
        # Only calculate loss on the meters (nodes with train_mask=True)
        loss = F.nll_loss(out[data.train_mask], data.y[data.train_mask])
        loss.backward()
        optimizer.step()
        
        if epoch % 10 == 0:
            # Calculate accuracy
            pred = out.argmax(dim=1)
            correct = (pred[data.train_mask] == data.y[data.train_mask]).sum()
            acc = int(correct) / int(data.train_mask.sum())
            print(f'Epoch: {epoch:03d}, Loss: {loss:.4f}, Acc: {acc:.4f}')
            
    # Final evaluation
    model.eval()
    pred = model(data.x, data.edge_index).argmax(dim=1)
    correct = (pred[data.train_mask] == data.y[data.train_mask]).sum()
    acc = int(correct) / int(data.train_mask.sum())
    print(f'Final Accuracy: {acc:.4f}')
    
    # Save the model
    os.makedirs("models", exist_ok=True)
    model_path = "models/gnn_grid_sage.pt"
    torch.save(model.state_dict(), model_path)
    print(f"GNN weights saved to {model_path}")

if __name__ == "__main__":
    train_gnn()
