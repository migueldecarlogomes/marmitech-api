using Marmitech.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Marmitech.Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Arroz carreteiro com frango e legumes", Description = "Arroz cremoso com frango desfiado, milho, ervilha e cenoura, temperado com ervas frescas.", Price = 24.90m, ImageUrl = "images/marmita1.png" },
            new Product { Id = 2, Name = "Estrogonofe de frango com arroz", Description = "Estrogonofe cremoso de frango, acompanhado de arroz branco soltinho e batata palha.", Price = 26.90m, ImageUrl = "images/marmita2.jpg" },
            new Product { Id = 3, Name = "Tilápia grelhada com purê de batata", Description = "Filé de tilápia grelhado ao limão, servido com purê de batata e brócolis no vapor.", Price = 29.90m, ImageUrl = "images/marmita3.webp" },
            new Product { Id = 4, Name = "Frango grelhado com quinoa", Description = "Peito de frango grelhado, quinoa refogada e mix de legumes salteados. Opção fit e proteica.", Price = 27.90m, ImageUrl = "images/marmita4.jpg" },
            new Product { Id = 5, Name = "Carne de panela com mandioca", Description = "Carne bovina cozida lentamente com mandioca, cenoura e temperos caseiros.", Price = 28.90m, ImageUrl = "images/marmita5.jpg" },
            new Product { Id = 6, Name = "Grão-de-bico com legumes assados", Description = "Grão-de-bico, abobrinha, berinjela e pimentão assados, com azeite e ervas finas.", Price = 22.90m, ImageUrl = "images/marmita6.jpg" }
        );
    }
}