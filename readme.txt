truncate:
aws dynamodb scan --table-name Users --projection-expression "userId" --query "Items[].userId" --output text | awk '{print "aws dynamodb delete-item --table-name Users --key \{\"userId\"\:\{\"S\"\:\""$1"\"\}\}"}' | sh


delete

aws dynamodb delete-item --table-name Users --key '{"userId": {"S": "1"}}' --endpoint-url http://localhost:8000

aws dynamodb get-item --table-name Users --key '{"userId": {"S": "1"}}' --endpoint-url http://localhost:8000

aws dynamodb delete-table --table-name User --endpoint-url http://localhost:8000