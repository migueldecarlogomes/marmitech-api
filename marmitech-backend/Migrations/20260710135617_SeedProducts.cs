using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace marmitech.backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Description", "ImageUrl", "Name", "Price" },
                values: new object[,]
                {
                    { 1, "Arroz cremoso com frango desfiado, milho, ervilha e cenoura, temperado com ervas frescas.", "images/marmita1.png", "Arroz carreteiro com frango e legumes", 24.90m },
                    { 2, "Estrogonofe cremoso de frango, acompanhado de arroz branco soltinho e batata palha.", "images/marmita2.jpg", "Estrogonofe de frango com arroz", 26.90m },
                    { 3, "Filé de tilápia grelhado ao limão, servido com purê de batata e brócolis no vapor.", "images/marmita3.webp", "Tilápia grelhada com purê de batata", 29.90m },
                    { 4, "Peito de frango grelhado, quinoa refogada e mix de legumes salteados. Opção fit e proteica.", "images/marmita4.jpg", "Frango grelhado com quinoa", 27.90m },
                    { 5, "Carne bovina cozida lentamente com mandioca, cenoura e temperos caseiros.", "images/marmita5.jpg", "Carne de panela com mandioca", 28.90m },
                    { 6, "Grão-de-bico, abobrinha, berinjela e pimentão assados, com azeite e ervas finas.", "images/marmita6.jpg", "Grão-de-bico com legumes assados", 22.90m }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 6);
        }
    }
}
