<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$sql = "SELECT 
            u.id, 
            u.nome, 
            u.email,
            SUM(CASE WHEN a.status_aprovacao = 'aprovado' THEN 1 ELSE 0 END) as approved_count,
            SUM(CASE WHEN a.status_aprovacao = 'pendente' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN a.status_aprovacao = 'rejeitado' THEN 1 ELSE 0 END) as rejected_count
        FROM usuarios u
        LEFT JOIN anuncios a ON u.id = a.usuario_id
        GROUP BY u.id
        ORDER BY u.nome ASC";

$resultado = $conexao->query($sql);
$relatorio = array();

if ($resultado && $resultado->num_rows > 0) {
    while($linha = $resultado->fetch_assoc()) {
        $relatorio[] = $linha;
    }
}
echo json_encode(array("status" => true, "relatorio" => $relatorio));
?>