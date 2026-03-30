<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

// Ordena primeiro por Disponíveis (vendido=0) e depois pelos IDs mais recentes
$sql = "SELECT * FROM anuncios 
        WHERE status_aprovacao = 'aprovado' 
        ORDER BY vendido ASC, id DESC";

$resultado = $conexao->query($sql);
$produtos = array();

if ($resultado && $resultado->num_rows > 0) {
    while($linha = $resultado->fetch_assoc()) {
        $produtos[] = $linha;
    }
    echo json_encode(array("mensagem" => "Sucesso", "status" => true, "produtos" => $produtos));
} else {
    echo json_encode(array("mensagem" => "Vazio", "status" => true, "produtos" => array()));
}
?>