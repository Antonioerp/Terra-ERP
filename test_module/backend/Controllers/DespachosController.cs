using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DespachosController : ControllerBase
    {
        private readonly string _connectionString;

        public DespachosController()
        {
            _connectionString = "Server=66.97.45.177;Port=3306;Database=agricola;User=Garciac;Password=Eco123456*;";
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Dictionary<string, object>>>> GetDespachos()
        {
            var despachos = new List<Dictionary<string, object>>();

            try
            {
                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // Obtener los datos
                    using (var command = new MySqlCommand("SELECT * FROM despachos_body LIMIT 10", connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var despacho = new Dictionary<string, object>();
                                
                                // Obtener todos los campos de la fila
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    var fieldName = reader.GetName(i);
                                    var value = reader.GetValue(i);
                                    despacho[fieldName] = value;
                                }

                                despachos.Add(despacho);
                            }
                        }
                    }
                }

                return Ok(despachos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error detallado: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
    }
} 