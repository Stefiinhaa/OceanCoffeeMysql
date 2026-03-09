<?php
// Substitua pelos DADOS EXATOS que o InfinityFree lhe deu
$servidor = "sql304.infinityfree.com"; // Substitua pelo seu Host Name
$usuario = "if0_41337854";       // Substitua pelo seu User Name
$senha = "STECLEri123 ";      // Substitua pela sua Password
$banco = "if0_41337854_oceancoffee"; // Substitua pelo seu DB Name

$conexao = new mysqli($servidor, $usuario, $senha, $banco);

if ($conexao->connect_error) {
    die("Falha na conexao: " . $conexao->connect_error);
}
?>