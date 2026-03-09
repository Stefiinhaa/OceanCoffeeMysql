<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$sql = "SELECT a.id, a.titulo, u.nome as nome_usuario 
        FROM anuncios a 
        LEFT JOIN usuarios u ON a.usuario_id = u.id 
        WHERE a.status_aprovacao = 'pendente' 
        ORDER BY a.id DESC LIMIT 5";

$resultado = $conexao->query($sql);
$solicitacoes = array();

if ($resultado && $resultado->num_rows > 0) {
    while($linha = $resultado->fetch_assoc()) {
        $solicitacoes[] = $linha;
    }
}
echo json_encode(array("status" => true, "solicitacoes" => $solicitacoes));
?>