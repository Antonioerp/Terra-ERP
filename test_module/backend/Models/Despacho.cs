using System;

namespace backend.Models
{
    public class Despacho
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public string? Cliente { get; set; }
        public string? Producto { get; set; }
        public decimal Cantidad { get; set; }
        public string? Estado { get; set; }
    }
} 