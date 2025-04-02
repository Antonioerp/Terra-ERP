using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using MySql.Data.MySqlClient;
using System.Text.Json;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class TablasController : ControllerBase
    {
        private readonly string _connectionString;

        public TablasController()
        {
            _connectionString = "Server=66.97.45.177;Port=3306;Database=agricola;User=Garciac;Password=Eco123456*;";
        }

        [HttpGet("tables")]
        public async Task<ActionResult<IEnumerable<string>>> GetTablas()
        {
            var tablas = new List<string>();

            try
            {
                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    using (var command = new MySqlCommand("SHOW TABLES", connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                tablas.Add(reader.GetString(0));
                            }
                        }
                    }
                }

                return Ok(tablas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("{tabla}")]
        public async Task<ActionResult<IEnumerable<Dictionary<string, object>>>> GetDatosTabla(string tabla)
        {
            try
            {
                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // Obtener datos de la tabla
                    var datos = new List<Dictionary<string, object>>();
                    using (var command = new MySqlCommand($"SELECT * FROM {tabla} LIMIT 100", connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var fila = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    var nombreColumna = reader.GetName(i);
                                    var valor = reader.GetValue(i);
                                    fila[nombreColumna] = valor;
                                }
                                datos.Add(fila);
                            }
                        }
                    }

                    return Ok(datos);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("{tabla}/structure")]
        public async Task<ActionResult<Dictionary<string, object>>> GetEstructuraTabla(string tabla)
        {
            try
            {
                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var estructura = new Dictionary<string, object>();
                    var columnas = new List<Dictionary<string, object>>();
                    var clavesForaneas = new List<Dictionary<string, object>>();

                    // Obtener información de las columnas
                    using (var command = new MySqlCommand($"DESCRIBE {tabla}", connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var columna = new Dictionary<string, object>
                                {
                                    ["nombre"] = reader["Field"].ToString(),
                                    ["tipo"] = reader["Type"].ToString(),
                                    ["nulo"] = reader["Null"].ToString() == "YES",
                                    ["clave"] = reader["Key"].ToString(),
                                    ["valorPorDefecto"] = reader["Default"] == DBNull.Value ? null : reader["Default"].ToString(),
                                    ["extra"] = reader["Extra"].ToString()
                                };
                                columnas.Add(columna);
                            }
                        }
                    }

                    // Obtener información de las claves foráneas
                    using (var command = new MySqlCommand(@"
                        SELECT 
                            COLUMN_NAME,
                            REFERENCED_TABLE_NAME,
                            REFERENCED_COLUMN_NAME
                        FROM information_schema.KEY_COLUMN_USAGE
                        WHERE TABLE_SCHEMA = 'agricola'
                        AND TABLE_NAME = @tabla
                        AND REFERENCED_TABLE_NAME IS NOT NULL", connection))
                    {
                        command.Parameters.AddWithValue("@tabla", tabla);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var claveForanea = new Dictionary<string, object>
                                {
                                    ["columna"] = reader["COLUMN_NAME"].ToString(),
                                    ["tablaReferenciada"] = reader["REFERENCED_TABLE_NAME"].ToString(),
                                    ["columnaReferenciada"] = reader["REFERENCED_COLUMN_NAME"].ToString()
                                };
                                clavesForaneas.Add(claveForanea);
                            }
                        }
                    }

                    estructura["columnas"] = columnas;
                    estructura["clavesForaneas"] = clavesForaneas;

                    return Ok(estructura);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("{tabla}")]
        public async Task<ActionResult> InsertarDatos(string tabla, [FromBody] JsonElement datos)
        {
            try
            {
                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // Obtener estructura de la tabla
                    var columnas = new List<string>();
                    using (var command = new MySqlCommand($"DESCRIBE {tabla}", connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                columnas.Add(reader["Field"].ToString());
                            }
                        }
                    }

                    // Construir la consulta INSERT
                    var columnasInsert = string.Join(", ", columnas);
                    var valoresInsert = string.Join(", ", columnas.Select(c => $"@{c}"));
                    var query = $"INSERT INTO {tabla} ({columnasInsert}) VALUES ({valoresInsert})";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Agregar parámetros
                        foreach (var columna in columnas)
                        {
                            if (datos.TryGetProperty(columna, out var valor))
                            {
                                command.Parameters.AddWithValue($"@{columna}", valor.GetString());
                            }
                        }

                        await command.ExecuteNonQueryAsync();
                    }
                }

                return Ok(new { message = "Datos insertados correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
    }
} 