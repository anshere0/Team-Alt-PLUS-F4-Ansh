import torch
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv


class GridGraphSAGE(torch.nn.Module):
    def __init__(self, in_channels=3, hidden_channels=16, out_channels=2):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        # First GraphSAGE layer
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        
        # Second layer to output classes (Normal=0, Anomaly=1)
        x = self.conv2(x, edge_index)
        
        return F.log_softmax(x, dim=1)
