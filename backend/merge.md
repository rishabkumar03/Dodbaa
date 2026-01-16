switch to the actual branch in which i want to merge the changes by: git switch branch_name
then run the command

git pull origin branch_name
to make sure my branch is up to date with remote repository

then run the command
git merge origin conflicted_branch_name
git add .
git commit -m "merged changes from conflicted_branch_name"
git push origin branch_name 