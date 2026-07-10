namespace Marmitech.Backend.DTOs;

public class CreateOrderRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}