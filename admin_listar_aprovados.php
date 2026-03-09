<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

// Seleciona os anúncios aprovados e faz a ligação com a tabela de utilizadores para obter o nome
$sql = "SELECT a.*, u.nome as nome_usuario 
        FROM anuncios a 
        LEFT JOIN usuarios u ON a.usuario_id = u.id 
        WHERE a.status_aprovacao = 'aprovado' 
        ORDER BY a.id DESC";

$resultado = $conexao->query($sql);
$aprovados = array();

if ($resultado && $resultado->num_rows > 0) {
    while($linha = $resultado->fetch_assoc()) {
        $aprovados[] = $linha;
    }
}

echo json_encode(array("status" => true, "aprovados" => $aprovados));
?>