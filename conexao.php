<?php
$host = "localhost";
$usuario = "root";
$senha = "";
$banco = "oceancoffee";

$conexao = new mysqli($host, $usuario, $senha, $banco);

if ($conexao->connect_error) {
    die("Falha na conexao");
}
?>