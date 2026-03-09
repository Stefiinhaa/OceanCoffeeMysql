<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$sql = "SELECT id, nome, email, tipo FROM usuarios ORDER BY nome ASC";
$resultado = $conexao->query($sql);

$usuarios = array();
if ($resultado && $resultado->num_rows > 0) {
    while($linha = $resultado->fetch_assoc()) {
        $usuarios[] = $linha;
    }
}

echo json_encode(array("status" => true, "usuarios" => $usuarios));
?>