import sys
sys.path.append("/opt/homebrew/share/git-filter-repo/python")

def callback(commit):
    message = commit.message.decode('utf-8')
    lines = message.split('\n')
    # Filter out any line mentioning Claude co-authoring
    cleaned_lines = [l for l in lines if "Co-authored-by: Claude" not in l]
    commit.message = '\n'.join(cleaned_lines).encode('utf-8')

# This executes the history filter
import git_filter_repo
git_filter_repo.RepoFilter(commit_callback=callback).run()
