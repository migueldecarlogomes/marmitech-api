using System.Security.Claims;
using Marmitech.Backend.Data;
using Marmitech.Backend.DTOs;
using Marmitech.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Marmitech.Backend.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrdersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest request)
    {
        var userId = GetUserId();

        var productIds = request.Items.Select(i => i.ProductId).ToList();
        var products = await _db.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        var order = new Order
        {
            UserId = userId,
            CustomerName = request.CustomerName,
            DeliveryAddress = request.DeliveryAddress,
            PaymentMethod = request.PaymentMethod
        };

        decimal total = 0;

        foreach (var item in request.Items)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
            {
                return BadRequest(new { message = $"Produto {item.ProductId} não encontrado." });
            }

            var subtotal = product.Price * item.Quantity;
            total += subtotal;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = product.Price,
                Quantity = item.Quantity
            });
        }

        order.Total = total;

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return Ok(ToResponse(order));
    }
    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetUserId();

        var orders = await _db.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var response = orders.Select(ToResponse).ToList();

        return Ok(response);
    }
    private int GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub");
        return int.Parse(value!);
    }

    private static OrderResponse ToResponse(Order order) => new()
    {
        Id = order.Id,
        CustomerName = order.CustomerName,
        DeliveryAddress = order.DeliveryAddress,
        PaymentMethod = order.PaymentMethod,
        Total = order.Total,
        CreatedAt = order.CreatedAt,
        Items = order.Items.Select(i => new OrderItemResponse
        {
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            UnitPrice = i.UnitPrice,
            Quantity = i.Quantity
        }).ToList()
    };
}